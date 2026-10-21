-- Organizer tokens are bearer credentials for gallery management.
-- Existing rows were verified to have unique URL-safe tokens of at least 22 chars.
ALTER TABLE public.events
  ALTER COLUMN organizer_token SET NOT NULL;

ALTER TABLE public.events
  ADD CONSTRAINT events_organizer_token_format_check
  CHECK (
    length(organizer_token) >= 22
    AND organizer_token ~ '^[A-Za-z0-9_-]+$'
  );
