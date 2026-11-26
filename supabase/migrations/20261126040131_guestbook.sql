-- Guestbook: comments are stored permanently; only the owner removes them (Table Editor → guestbook).
create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nick text not null check (char_length(nick) between 2 and 32),
  body text not null check (char_length(body) between 2 and 500),
  hidden boolean not null default false,
  author text
);
create index if not exists guestbook_created_at on public.guestbook (created_at desc);
alter table public.guestbook enable row level security;
revoke all on public.guestbook from anon, authenticated;

create or replace function public.add_comment(p_nick text, p_text text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.client_key('comment');
  v_nick text;
  v_body text;
  found_row public.guestbook;
begin
  v_nick := regexp_replace(coalesce(p_nick, ''), '[\u0001-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]', '', 'g');
  v_nick := btrim(regexp_replace(v_nick, '\s+', ' ', 'g'));
  v_body := regexp_replace(coalesce(p_text, ''), '[\u0001-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]', '', 'g');
  v_body := btrim(regexp_replace(v_body, '\n{3,}', E'\n\n', 'g'));
  if char_length(v_nick) not between 2 and 32 or char_length(v_body) not between 2 and 500 then
    raise exception 'bad_length';
  end if;
  if (v_nick || ' ' || v_body) ~* '(https?://|www\.|t\.me/|\m[[:alnum:]_-]+\.(com|net|org|ru|uz|io|me|xyz|top|info|site|online|shop|click|link|biz|club|pro)\M)' then
    raise exception 'links';
  end if;
  select * into found_row from guestbook g
  where lower(g.nick) = lower(v_nick) and lower(g.body) = lower(v_body) and g.created_at > now() - interval '1 day'
  limit 1;
  if found then
    return json_build_object('id', found_row.id, 'created_at', found_row.created_at);
  end if;
  if (select count(*) from throttle where key = k and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from throttle where key = k and created_at > now() - interval '1 day') >= 15
     or (select count(*) from guestbook where created_at > now() - interval '1 day') >= 300 then
    raise exception 'slow_down';
  end if;
  insert into throttle (key) values (k);
  insert into guestbook (nick, body, author) values (v_nick, v_body, k) returning * into found_row;
  return json_build_object('id', found_row.id, 'created_at', found_row.created_at);
end;
$$;

create or replace function public.list_comments(p_limit int default 200)
returns table (id bigint, created_at timestamptz, nick text, body text)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.created_at, g.nick, g.body
  from guestbook g
  where not g.hidden
  order by g.created_at desc
  limit least(greatest(coalesce(p_limit, 200), 1), 500);
$$;

revoke all on function public.add_comment(text, text) from public, authenticated;
revoke all on function public.list_comments(int) from public, authenticated;
grant execute on function public.add_comment(text, text) to anon;
grant execute on function public.list_comments(int) to anon;
