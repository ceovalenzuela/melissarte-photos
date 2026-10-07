-- MelissArte Photos
-- Per-event control for guest written/audio messages.
--
-- Existing events keep messages enabled so the new setting does not
-- unexpectedly change their current behavior. New events default to disabled
-- and can be enabled when the selected package includes messages.

alter table public.events
  add column if not exists messages_enabled boolean;

update public.events
set messages_enabled = true
where messages_enabled is null;

alter table public.events
  alter column messages_enabled set default false,
  alter column messages_enabled set not null;

create or replace function public.is_published_event(
  p_event_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events
    where id = p_event_id
      and status = 'published'
      and messages_enabled = true
  );
$$;

revoke all on function public.is_published_event(uuid) from public;
grant execute on function public.is_published_event(uuid) to anon, authenticated;
