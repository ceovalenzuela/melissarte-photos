-- Separate event publication from the optional guest-messaging feature.
--
-- Photo uploads and photo metadata are allowed for any published event.
-- Guest text/audio messages and audio uploads additionally require
-- messages_enabled = true.
--
-- This migration records the production hotfix applied on 2026-11-23.
-- Keep both predicates distinct: do not add messages_enabled back to
-- is_published_event(), because Storage photo-upload RLS depends on it.

begin;

create or replace function public.is_published_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.events
    where id = p_event_id
      and status = 'published'
  );
$function$;

revoke all on function public.is_published_event(uuid) from public;
grant execute on function public.is_published_event(uuid) to anon, authenticated;

create or replace function public.is_published_event_with_messages(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.events
    where id = p_event_id
      and status = 'published'
      and messages_enabled = true
  );
$function$;

revoke all on function public.is_published_event_with_messages(uuid) from public;
grant execute on function public.is_published_event_with_messages(uuid) to anon, authenticated;

-- Guest text/audio message inserts require the optional messages feature.
drop policy if exists "Guests can create messages for published events" on public.messages;
create policy "Guests can create messages for published events"
on public.messages
for insert
to anon, authenticated
with check (
  public.is_published_event_with_messages(event_id)
  and (
    message_type = 'text'
    or (
      message_type = 'audio'
      and array_length(string_to_array(file_path, '/'), 1) = 3
      and file_path = event_id::text || '/audio/' || split_part(file_path, '/', 3)
      and split_part(file_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](webm|ogg|m4a)$'
    )
  )
);

-- Guest audio uploads follow the same optional feature flag.
drop policy if exists "Guests can upload event message audio" on storage.objects;
create policy "Guests can upload event message audio"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'event-messages'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] = 'audio'
  and split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](webm|ogg|m4a)$'
  and case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.is_published_event_with_messages(((storage.foldername(name))[1])::uuid)
    else false
  end
);

commit;
