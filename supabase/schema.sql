create extension if not exists pgcrypto with schema extensions;

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  page text not null,
  source text not null check (source ~ '^[a-z0-9.-]{1,32}$'),
  place text check (char_length(place) <= 64),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  lang text check (char_length(lang) <= 8)
);

alter table public.visits drop constraint if exists visits_page_check;
alter table public.visits
  add constraint visits_page_check check (page in ('home', 'services', 'voip', 'about', 'info', 'who', 'contact'));
create index if not exists visits_created_at on public.visits (created_at desc);

create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  stars smallint not null check (stars between 1 and 5)
);

alter table public.ratings add column if not exists voter text;
create unique index if not exists ratings_voter on public.ratings (voter);

create table if not exists public.throttle (
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists throttle_key_time on public.throttle (key, created_at desc);
create index if not exists throttle_time on public.throttle (created_at);

create table if not exists public.secrets (
  name text primary key,
  value text not null
);
insert into public.secrets (name, value)
values ('salt', encode(extensions.gen_random_bytes(16), 'hex'))
on conflict (name) do nothing;

alter table public.visits enable row level security;
alter table public.ratings enable row level security;
alter table public.throttle enable row level security;
alter table public.secrets enable row level security;

drop policy if exists "anyone can add a visit" on public.visits;
drop policy if exists "anyone can rate" on public.ratings;
revoke all on public.visits, public.ratings, public.throttle, public.secrets from anon, authenticated;

create or replace function public.client_key(kind text)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select encode(
    extensions.digest(
      coalesce(
        nullif(current_setting('request.headers', true)::json ->> 'cf-connecting-ip', ''),
        nullif(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), ''),
        nullif(current_setting('request.headers', true)::json ->> 'x-real-ip', ''),
        'unknown'
      ) || '|' || kind || '|' || (select value from public.secrets where name = 'salt'),
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.add_visit(p_page text, p_source text, p_place text, p_device text, p_lang text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.client_key('visit');
begin
  if (select count(*) from throttle where key = k and created_at > now() - interval '1 hour') >= 40 then
    return;
  end if;
  if (select count(*) from visits where created_at > now() - interval '1 hour') >= 3000 then
    return;
  end if;
  insert into throttle (key) values (k);
  insert into visits (page, source, place, device, lang)
  values (p_page, p_source, left(p_place, 64), p_device, left(p_lang, 8));
  delete from throttle where created_at < now() - interval '2 days';
end;
$$;

create or replace function public.add_rating(p_stars int)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.client_key('rate');
begin
  if p_stars is null or p_stars < 1 or p_stars > 5 then
    raise exception 'stars must be 1..5';
  end if;
  if (select count(*) from throttle where key = k and created_at > now() - interval '1 hour') >= 5 then
    return;
  end if;
  if (select count(*) from ratings where created_at > now() - interval '1 day') >= 300 then
    return;
  end if;
  insert into throttle (key) values (k);
  insert into ratings (stars, voter)
  values (p_stars, k)
  on conflict (voter) do update set stars = excluded.stars, created_at = now();
end;
$$;

create or replace function public.visit_summary()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from visits),
    'today', (select count(*) from visits where created_at >= date_trunc('day', now())),
    'sources', coalesce((select json_agg(s order by s.n desc) from (select source, count(*) as n from visits group by source) s), '[]'::json),
    'pages', coalesce((select json_agg(p order by p.n desc) from (select page, count(*) as n from visits group by page) p), '[]'::json),
    'recent', coalesce((select json_agg(r) from (select created_at, source, page, place, device from visits order by created_at desc limit 12) r), '[]'::json)
  );
$$;

create or replace function public.rating_summary()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'count', count(*),
    'average', coalesce(round(avg(stars)::numeric, 2), 0),
    'stars', json_build_object(
      '1', count(*) filter (where stars = 1),
      '2', count(*) filter (where stars = 2),
      '3', count(*) filter (where stars = 3),
      '4', count(*) filter (where stars = 4),
      '5', count(*) filter (where stars = 5)
    )
  )
  from ratings;
$$;

revoke all on function public.client_key(text) from public, anon, authenticated;
revoke all on function public.add_visit(text, text, text, text, text) from public;
revoke all on function public.add_rating(int) from public;
revoke all on function public.visit_summary() from public;
revoke all on function public.rating_summary() from public;
grant execute on function public.add_visit(text, text, text, text, text) to anon;
grant execute on function public.add_rating(int) to anon;
grant execute on function public.visit_summary() to anon;
grant execute on function public.rating_summary() to anon;
