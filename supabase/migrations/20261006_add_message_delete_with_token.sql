-- Allow event organizers to delete their own guest messages
-- using the private organizer token from the dashboard.

create or replace function public.delete_message_with_token(
  p_message_id uuid,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_file_path text;
  v_event_id uuid;
begin
  select
    m.file_path,
    m.event_id
  into
    v_file_path,
    v_event_id
  from public.messages m
  join public.events e
    on e.id = m.event_id
  where m.id = p_message_id
    and e.organizer_token = p_token;

  if not found then
    return false;
  end if;

  if v_file_path is not null then
    delete from storage.objects
    where bucket_id = 'event-messages'
      and name = v_file_path;
  end if;

  delete from public.messages
  where id = p_message_id
    and event_id = v_event_id;

  return found;
end;
$$;

revoke all on function public.delete_message_with_token(uuid, text)
  from public;

grant execute on function public.delete_message_with_token(uuid, text)
  to anon, authenticated;
