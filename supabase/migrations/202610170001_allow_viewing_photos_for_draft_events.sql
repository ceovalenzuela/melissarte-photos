-- Existing photos remain visible when an event is in draft.
-- Draft status still prevents guests from uploading new photos (see the INSERT
-- policies in 202610160001_protect_unpublished_event_photos.sql).
-- Photo rows and their public Storage URLs were already public before the
-- unpublished-event protection was introduced; restore that read behavior.
DROP POLICY IF EXISTS "Public can view photos from published events" ON public.photos;
DROP POLICY IF EXISTS "Public can view photos" ON public.photos;

CREATE POLICY "Public can view photos"
ON public.photos
FOR SELECT
TO anon, authenticated
USING (true);
