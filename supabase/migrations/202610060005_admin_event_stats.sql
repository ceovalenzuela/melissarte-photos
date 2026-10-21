-- Estadísticas agregadas para el panel administrativo.
-- Calcula los conteos y la última actividad en la base de datos
-- para evitar recorrer las tablas de contenido desde el navegador.

create index if not exists photos_event_id_uploaded_at_idx
  on public.photos (event_id, uploaded_at desc);

create or replace function public.get_admin_event_stats()
returns table (
  event_id uuid,
  photo_count bigint,
  message_count bigint,
  last_activity_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with photo_stats as (
    select
      event_id,
      count(*)::bigint as photo_count,
      max(uploaded_at) as last_photo_at
    from public.photos
    group by event_id
  ),
  message_stats as (
    select
      event_id,
      count(*)::bigint as message_count,
      max(created_at) as last_message_at
    from public.messages
    group by event_id
  )
  select
    e.id as event_id,
    coalesce(p.photo_count, 0)::bigint as photo_count,
    coalesce(m.message_count, 0)::bigint as message_count,
    case
      when p.last_photo_at is null then m.last_message_at
      when m.last_message_at is null then p.last_photo_at
      else greatest(p.last_photo_at, m.last_message_at)
    end as last_activity_at
  from public.events e
  left join photo_stats p
    on p.event_id = e.id
  left join message_stats m
    on m.event_id = e.id;
$$;

revoke all on function public.get_admin_event_stats() from public;
grant execute on function public.get_admin_event_stats() to authenticated;

-- Recovered legacy migration content. These settings are already present in production;
-- keep them in the replay path because their original standalone versions were not recorded.

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
