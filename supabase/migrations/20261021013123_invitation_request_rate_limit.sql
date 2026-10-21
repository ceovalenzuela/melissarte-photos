create schema if not exists private;

create table if not exists private.invitation_request_rate_limits (
  fingerprint text primary key check (fingerprint ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1),
  updated_at timestamptz not null
);

create index if not exists invitation_request_rate_limits_updated_at_idx
  on private.invitation_request_rate_limits (updated_at);

alter table private.invitation_request_rate_limits enable row level security;

revoke all on schema private from public, anon, authenticated;
revoke all on table private.invitation_request_rate_limits from public, anon, authenticated;

create or replace function public.consume_invitation_request_rate_limit(
  p_fingerprint text,
  p_max_requests integer default 8,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid request fingerprint.';
  end if;

  if p_max_requests < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit configuration.';
  end if;

  delete from private.invitation_request_rate_limits
  where updated_at < v_now - interval '1 day';

  insert into private.invitation_request_rate_limits as stored (
    fingerprint,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_fingerprint,
    v_now,
    1,
    v_now
  )
  on conflict (fingerprint) do update
  set
    window_started_at = case
      when stored.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else stored.window_started_at
    end,
    request_count = case
      when stored.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else stored.request_count + 1
    end,
    updated_at = v_now
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_invitation_request_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_invitation_request_rate_limit(text, integer, integer)
  to service_role;
