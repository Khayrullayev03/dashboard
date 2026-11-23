create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  page text not null check (page in ('home', 'services', 'about', 'info', 'who', 'contact')),
  source text not null check (source ~ '^[a-z0-9.-]{1,32}$'),
  place text check (char_length(place) <= 64),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  lang text check (char_length(lang) <= 8)
);

create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  stars smallint not null check (stars between 1 and 5)
);

alter table public.visits enable row level security;
alter table public.ratings enable row level security;

drop policy if exists "anyone can add a visit" on public.visits;
create policy "anyone can add a visit" on public.visits for insert to anon with check (true);

drop policy if exists "anyone can rate" on public.ratings;
create policy "anyone can rate" on public.ratings for insert to anon with check (true);

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

grant execute on function public.visit_summary() to anon;
grant execute on function public.rating_summary() to anon;
