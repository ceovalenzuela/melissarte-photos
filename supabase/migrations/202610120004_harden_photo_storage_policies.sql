-- Restrict cover uploads to the allowlisted administrator and validate guest-photo paths.
-- Public reads remain enabled; draft event uploads are not filtered by event status.

DROP POLICY IF EXISTS "imagenes 1lc5bn3_1" ON storage.objects;
CREATE POLICY "Admins can upload event covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-covers'
  AND public.is_admin_user()
);

DROP POLICY IF EXISTS "fotos 1rdror8_1" ON storage.objects;
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
      AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    )
    OR
    (
      (storage.foldername(name))[2] = 'thumbnails'
      AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$'
    )
  )
);

DROP POLICY IF EXISTS "Anyone can upload photos" ON public.photos;
CREATE POLICY "Guests can insert photos with matching storage paths"
ON public.photos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  file_path = event_id::text || '/originals/' || split_part(file_path, '/', 3)
  AND thumbnail_path = event_id::text || '/thumbnails/' || split_part(thumbnail_path, '/', 3)
  AND split_part(file_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  AND split_part(thumbnail_path, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$'
);