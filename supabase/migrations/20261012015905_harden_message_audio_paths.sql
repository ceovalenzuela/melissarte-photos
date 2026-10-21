-- Restrict message-audio storage paths and ensure guest message rows cannot reference another event's audio.
-- Keep published-event behavior unchanged; organizers continue to delete audio through the token-validated Edge Function.

DROP POLICY IF EXISTS "Guests can create messages for published events" ON public.messages;
CREATE POLICY "Guests can create messages for published events"
ON public.messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.is_published_event(event_id)
  AND (
    message_type = 'text'
    OR (
      message_type = 'audio'
      AND array_length(string_to_array(file_path, '/'), 1) = 3
      AND file_path = event_id::text || '/audio/' || split_part(file_path, '/', 3)
      AND split_part(file_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](webm|ogg|m4a)$'
    )
  )
);

DROP POLICY IF EXISTS "Guests can upload event message audio" ON storage.objects;
CREATE POLICY "Guests can upload event message audio"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'event-messages'
  AND array_length(storage.foldername(name), 1) = 2
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND (storage.foldername(name))[2] = 'audio'
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](webm|ogg|m4a)$'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_published_event(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
);

DROP POLICY IF EXISTS "Authenticated users can delete event message audio" ON storage.objects;
CREATE POLICY "Admins can delete event message audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-messages'
  AND public.is_admin_user()
);
