-- Allow organizers to delete guest messages using the same
-- two-step RPC pattern used by dashboard photo deletion.

create or replace function public.delete_message_with_token(
  p_event_id uuid,
  p_message_id uuid,
  p_token text
)
returns table (
  id uuid,
  file_path text
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.file_path
  from public.messages m
  join public.events e
    on e.id = m.event_id
  where m.id = p_message_id
    and m.event_id = p_event_id
    and e.organizer_token = p_token;
$$;

revoke all on function public.delete_message_with_token(uuid, uuid, text)
  from public;

grant execute on function public.delete_message_with_token(uuid, uuid, text)
  to anon, authenticated;

create or replace function public.delete_message_record_with_token(
  p_event_id uuid,
  p_message_id uuid,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.messages m
  using public.events e
  where m.id = p_message_id
    and m.event_id = p_event_id
    and e.id = m.event_id
    and e.organizer_token = p_token;

  get diagnostics deleted_count = row_count;

  return deleted_count > 0;
end;
$$;

revoke all on function public.delete_message_record_with_token(uuid, uuid, text)
  from public;

grant execute on function public.delete_message_record_with_token(uuid, uuid, text)
  to anon, authenticated;
