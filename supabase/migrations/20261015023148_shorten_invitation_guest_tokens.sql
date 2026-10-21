-- Shorten personalized invitation guest tokens to 22 URL-safe characters.
-- 16 random bytes provide 128 bits of entropy; organizer tokens and gallery URLs are untouched.
-- Existing personalized guest links are intentionally rotated for the current test invitations.
UPDATE public.invitation_guests
SET guest_token = translate(rtrim(encode(extensions.gen_random_bytes(16), 'base64'), '='), '+/', '-_'),
    updated_at = now()
WHERE guest_token IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_or_create_invitation_guest_link(
  p_event_id uuid,
  p_organizer_token text,
  p_guest_id uuid
)
RETURNS TABLE(guest_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_token text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE public.invitation_guests g
  SET guest_token = coalesce(
        g.guest_token,
        translate(rtrim(encode(extensions.gen_random_bytes(16), 'base64'), '='), '+/', '-_')
      ),
      updated_at = now()
  WHERE g.id = p_guest_id AND g.event_id = p_event_id
  RETURNING g.guest_token INTO v_token;

  IF v_token IS NULL THEN
    RAISE EXCEPTION 'Invitado no encontrado';
  END IF;

  RETURN QUERY SELECT v_token;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_or_create_invitation_guest_link(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_invitation_guest_link(uuid, text, uuid) TO anon, authenticated, service_role;
