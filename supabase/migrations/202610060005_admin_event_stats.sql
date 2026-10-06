-- Estadísticas agregadas para el panel administrativo.
-- Evita recorrer toda la tabla de fotografías desde el navegador.

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
  left join lateral (
    select
      count(*) as photo_count,
      max(uploaded_at) as last_photo_at
    from public.photos
    where event_id = e.id
  ) p on true
  left join lateral (
    select
      count(*) as message_count,
      max(created_at) as last_message_at
    from public.messages
    where event_id = e.id
  ) m on true;
$$;

revoke all on function public.get_admin_event_stats() from public;
grant execute on function public.get_admin_event_stats() to authenticated;
