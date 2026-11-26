-- Cache for the public feeds the site shows (SANS ISC attack stats, NVD/EPSS vulnerabilities).
-- Only the `feeds` Edge Function (service role) reads and writes it.
create table if not exists public.feed_cache (
  key text primary key,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);
alter table public.feed_cache enable row level security;
revoke all on public.feed_cache from anon, authenticated;
