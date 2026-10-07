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
