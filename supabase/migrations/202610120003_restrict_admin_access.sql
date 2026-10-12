-- Restrict administrative database operations to the existing admin account.
-- Public event/gallery RPCs and organizer-token RPCs are intentionally unchanged.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;

-- Seed only the current, existing administrative account verified during audit.
INSERT INTO public.admin_users (user_id)
VALUES ('93c87a91-13db-4566-bf27-8086e7d9d116'::uuid)
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = (SELECT auth.uid())
  );
$function$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, service_role;

-- Events are administered through the authenticated panel; public viewing stays
-- on the existing public RPC and gallery routes.
DROP POLICY IF EXISTS "Permitir leer eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir insertar eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir actualizar eventos" ON public.events;
DROP POLICY IF EXISTS "Permitir eliminar eventos" ON public.events;

CREATE POLICY "Admins can read events"
ON public.events FOR SELECT TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE TO authenticated
USING (public.is_admin_user());

REVOKE ALL ON TABLE public.events FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

-- Replace broad "any signed-in user" message access with explicit admin access.
DROP POLICY IF EXISTS "Authenticated users can read all event messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete event messages" ON public.messages;

CREATE POLICY "Admins can read all event messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can delete event messages"
ON public.messages FOR DELETE TO authenticated
USING (public.is_admin_user());

-- Harden SECURITY DEFINER admin functions independently of table policies.
CREATE OR REPLACE FUNCTION public.delete_photo_admin(p_photo_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  DELETE FROM public.photos WHERE id = p_photo_id;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_photos_admin(p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  DELETE FROM public.photos WHERE event_id = p_event_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_event_stats()
RETURNS TABLE (
  event_id uuid,
  photo_count bigint,
  message_count bigint,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  WITH photo_stats AS (
    SELECT p.event_id, count(*)::bigint AS photo_count, max(p.uploaded_at) AS last_photo_at
    FROM public.photos p
    GROUP BY p.event_id
  ),
  message_stats AS (
    SELECT m.event_id, count(*)::bigint AS message_count, max(m.created_at) AS last_message_at
    FROM public.messages m
    GROUP BY m.event_id
  )
  SELECT
    e.id,
    coalesce(ps.photo_count, 0)::bigint,
    coalesce(ms.message_count, 0)::bigint,
    CASE
      WHEN ps.last_photo_at IS NULL THEN ms.last_message_at
      WHEN ms.last_message_at IS NULL THEN ps.last_photo_at
      ELSE greatest(ps.last_photo_at, ms.last_message_at)
    END
  FROM public.events e
  LEFT JOIN photo_stats ps ON ps.event_id = e.id
  LEFT JOIN message_stats ms ON ms.event_id = e.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.delete_photo_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_photo_admin(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.delete_photos_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_photos_admin(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_admin_event_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_event_stats() TO authenticated, service_role;
