-- Generic anonymous aggregate counter table, reusable for any
-- "N times this happened" stat the app needs (starting with files
-- uploaded). No per-user identity, no file content, no IP address —
-- just a running count per stat key. Mirrors the same anonymous-
-- aggregate pattern already used for quiz comprehension stats.

create table app_stats (
  stat_key text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table app_stats enable row level security;

-- No SELECT policy for anon/authenticated — these are internal counters,
-- not content to display back to visitors. Only the increment function
-- below can touch this table from the client.

create function increment_app_stat(p_stat_key text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into app_stats (stat_key, count, updated_at)
  values (p_stat_key, 1, now())
  on conflict (stat_key)
  do update set count = app_stats.count + 1, updated_at = now();
$$;

revoke all on function increment_app_stat(text) from public;
grant execute on function increment_app_stat(text) to anon, authenticated;
