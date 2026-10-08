-- MelissArte Photos
-- Expose the per-event message setting to public/organizer event loaders.
--
-- The existing get_public_event_by_slug() function may return a fixed set
-- of columns, so we expose this setting through a small dedicated function
-- instead of replacing that function and risking changes to its contract.

create or replace function public.get_event_messages_enabled(
  p_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select messages_enabled
      from public.events
      where slug = p_slug
      limit 1
    ),
    false
  );
$$;

revoke all on function public.get_event_messages_enabled(text) from public;
grant execute on function public.get_event_messages_enabled(text) to anon, authenticated;
