-- Correct regex escaping in the photo upload path policies.
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

DROP POLICY IF EXISTS "Guests can insert photos with matching storage paths" ON public.photos;
CREATE POLICY "Guests can insert photos with matching storage paths"
ON public.photos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  file_path = event_id::text || '/originals/' || split_part(file_path, '/', 3)
  AND thumbnail_path = event_id::text || '/thumbnails/' || split_part(thumbnail_path, '/', 3)
  AND split_part(file_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|jpeg|png|webp)$'
  AND split_part(thumbnail_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
);