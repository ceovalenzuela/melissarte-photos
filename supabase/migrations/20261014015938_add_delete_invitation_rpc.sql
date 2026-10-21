-- Allow an authorized event organizer/admin panel to remove only the invitation and its RSVP responses.
-- The event, gallery, photos, messages, event slug, and invitation entitlement are preserved.
CREATE OR REPLACE FUNCTION public.delete_invitation_with_token(
  p_event_id uuid,
  p_organizer_token text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_deleted integer;
BEGIN
  IF p_event_id IS NULL
     OR p_organizer_token IS NULL
     OR char_length(p_organizer_token) < 22
     OR p_organizer_token !~ '^[A-Za-z0-9_-]+$' THEN
    RAISE EXCEPTION 'Datos de autorización no válidos';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = p_event_id
      AND e.organizer_token = p_organizer_token
      AND e.invitation_enabled = true
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para eliminar esta invitación';
  END IF;

  DELETE FROM public.invitations i
  WHERE i.event_id = p_event_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted > 0;
END;
$function$;

REVOKE ALL ON FUNCTION public.delete_invitation_with_token(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_invitation_with_token(uuid, text) TO anon, authenticated, service_role;
