-- Push a notification to the owner's ntfy app for every new comment.
-- The topic lives only in public.secrets (name 'notify_topic'), never in the site code.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  t text;
begin
  select value into t from secrets where name = 'notify_topic';
  if t is not null then
    perform net.http_post(
      url := 'https://ntfy.sh/',
      body := jsonb_build_object('topic', t, 'title', new.nick, 'message', new.body, 'tags', jsonb_build_array('speech_balloon'))
    );
  end if;
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.notify_comment() from public, anon, authenticated;

drop trigger if exists guestbook_notify on public.guestbook;
create trigger guestbook_notify after insert on public.guestbook
for each row execute function public.notify_comment();
