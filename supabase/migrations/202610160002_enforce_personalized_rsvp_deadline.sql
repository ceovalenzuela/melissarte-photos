-- Keep personalized guest RSVP behavior aligned with the general RSVP flow:
-- honor the RSVP deadline and the event-level invitation entitlement.
-- Additive migration; no existing invitation or RSVP rows are modified.

CREATE OR REPLACE FUNCTION public.get_public_invitation_guest(
  p_invitation_slug text,
  p_guest_token text
)
RETURNS TABLE (
  guest_id uuid,
  guest_name text,
  phone text,
  passes integer,
  response_id uuid,
  attendance_status text,
  party_size integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT g.id, g.name, g.phone, g.passes, r.id, r.attendance_status, r.party_size
  FROM public.invitation_guests g
  JOIN public.invitations i ON i.event_id = g.event_id
  JOIN public.events e ON e.id = i.event_id
  LEFT JOIN public.rsvp_responses r ON r.guest_id = g.id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true
    AND g.guest_token = p_guest_token
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.submit_invitation_guest_rsvp(
  p_invitation_slug text,
  p_guest_token text,
  p_guest_name text,
  p_attendance_status text,
  p_party_size integer,
  p_phone text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_guest_id uuid;
  v_invitation_id uuid;
  v_passes integer;
  v_rsvp_deadline text;
  v_today_monterrey text;
  v_response_id uuid;
BEGIN
  IF p_guest_name IS NULL
     OR char_length(btrim(p_guest_name)) NOT BETWEEN 1 AND 80
     OR (p_phone IS NOT NULL AND char_length(p_phone) > 30)
     OR p_attendance_status IS NULL
     OR p_attendance_status NOT IN ('attending', 'declined') THEN
    RAISE EXCEPTION 'Revisa los datos de tu confirmación';
  END IF;

  SELECT g.id, i.id, g.passes, i.content_config->>'rsvp_deadline'
    INTO v_guest_id, v_invitation_id, v_passes, v_rsvp_deadline
  FROM public.invitation_guests g
  JOIN public.invitations i ON i.event_id = g.event_id
  JOIN public.events e ON e.id = i.event_id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true
    AND g.guest_token = p_guest_token
  FOR UPDATE OF g;

  IF v_guest_id IS NULL THEN
    RAISE EXCEPTION 'Este enlace personalizado no está disponible';
  END IF;

  -- Date-only deadlines remain valid through the end of that date in Monterrey.
  v_today_monterrey := to_char(now() AT TIME ZONE 'America/Monterrey', 'YYYY-MM-DD');
  IF v_rsvp_deadline ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
     AND v_today_monterrey > v_rsvp_deadline THEN
    RAISE EXCEPTION 'El plazo para confirmar terminó el %', v_rsvp_deadline;
  END IF;

  IF (p_attendance_status = 'attending'
      AND (p_party_size IS NULL OR p_party_size < 1 OR p_party_size > v_passes))
     OR (p_attendance_status = 'declined'
      AND coalesce(p_party_size, -1) <> 0) THEN
    RAISE EXCEPTION 'La cantidad de personas supera los pases asignados';
  END IF;

  SELECT r.id INTO v_response_id
  FROM public.rsvp_responses r
  WHERE r.guest_id = v_guest_id
  LIMIT 1;

  IF v_response_id IS NULL THEN
    INSERT INTO public.rsvp_responses (
      invitation_id, guest_id, guest_name, attendance_status,
      party_size, phone, edit_token_hash
    )
    VALUES (
      v_invitation_id, v_guest_id, btrim(p_guest_name), p_attendance_status,
      p_party_size, nullif(btrim(p_phone), ''),
      encode(
        extensions.digest(
          convert_to(encode(extensions.gen_random_bytes(32), 'hex'), 'UTF8'),
          'sha256'
        ),
        'hex'
      )
    );
  ELSE
    UPDATE public.rsvp_responses
    SET guest_name = btrim(p_guest_name),
        attendance_status = p_attendance_status,
        party_size = p_party_size,
        phone = nullif(btrim(p_phone), ''),
        updated_at = now()
    WHERE id = v_response_id;
  END IF;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_public_invitation_guest(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_invitation_guest(text, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_invitation_guest_rsvp(text, text, text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invitation_guest_rsvp(text, text, text, text, integer, text) TO anon, authenticated, service_role;
