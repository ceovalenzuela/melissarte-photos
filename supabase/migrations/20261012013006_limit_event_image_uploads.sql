-- Bound public image uploads without changing bucket visibility or existing objects.
-- Keep all image formats currently present in production and allow WebP for covers.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id IN ('event-covers', 'event-photos');

DO $$
BEGIN
  IF (SELECT count(*) FROM storage.buckets
      WHERE id IN ('event-covers', 'event-photos')
        AND file_size_limit = 10485760
        AND allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]) <> 2 THEN
    RAISE EXCEPTION 'No se pudieron verificar los límites de carga de imágenes';
  END IF;
END $$;