-- Prevent direct photo metadata reads and new photo uploads for unpublished events.
-- This migration does not make public Storage URLs private; existing objects in public
-- buckets can still be fetched by URL. A separate signed-URL migration is required
-- before claiming unpublished object files are private.

DROP POLICY IF EXISTS "Public can view photos" ON public.photos;
CREATE POLICY "Public can view photos from published events"
ON public.photos
FOR SELECT
TO anon, authenticated
USING (public.is_published_event(event_id));

DROP POLICY IF EXISTS "Guests can insert photos with matching storage paths" ON public.photos;
CREATE POLICY "Guests can insert photos with matching storage paths"
ON public.photos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.is_published_event(event_id)
  AND file_path = event_id::text || '/originals/' || split_part(file_path, '/', 3)
  AND thumbnail_path = event_id::text || '/thumbnails/' || split_part(thumbnail_path, '/', 3)
  AND split_part(file_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|jpeg|png|webp)$'
  AND split_part(thumbnail_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
);

DROP POLICY IF EXISTS "Guests can upload event photos to expected paths" ON storage.objects;
CREATE POLICY "Guests can upload event photos to expected paths"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'event-photos'
  AND array_length(storage.foldername(name), 1) = 2
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND (storage.foldername(name))[2] IN ('originals', 'thumbnails')
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_published_event(((storage.foldername(name))[1])::uuid)
    ELSE false
  END
  AND (
    (
      (storage.foldername(name))[2] = 'originals'
      AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|jpeg|png|webp)$'
    )
    OR
    (
      (storage.foldername(name))[2] = 'thumbnails'
      AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
    )
  )
);
