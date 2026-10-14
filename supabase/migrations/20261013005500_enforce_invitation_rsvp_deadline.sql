-- Enforce RSVP deadlines for both new confirmations and edits.
-- Date-only deadlines are inclusive through the end of the date in Monterrey time.
CREATE OR REPLACE FUNCTION public.submit_invitation_rsvp(
  p_invitation_slug text, p_guest_name text, p_attendance_status text,
  p_party_size integer, p_phone text DEFAULT NULL
)
RETURNS TABLE (response_id uuid, edit_token text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_invitation_id uuid;
  v_max_party_size integer;
  v_rsvp_deadline text;
  v_today_monterrey text;
  v_edit_token text;
  v_response_id uuid;
BEGIN
  IF p_guest_name IS NULL OR char_length(btrim(p_guest_name)) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Escribe un nombre de 1 a 80 caracteres';
  END IF;
  IF p_phone IS NOT NULL AND char_length(p_phone) > 30 THEN
    RAISE EXCEPTION 'El teléfono es demasiado largo';
  END IF;
  IF p_attendance_status IS NULL OR p_attendance_status NOT IN ('attending', 'declined') THEN
    RAISE EXCEPTION 'Respuesta de asistencia no válida';
  END IF;

  SELECT i.id, i.max_party_size, i.content_config->>'rsvp_deadline'
    INTO v_invitation_id, v_max_party_size, v_rsvp_deadline
  FROM public.invitations i
  JOIN public.events e ON e.id = i.event_id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true;

  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'La confirmación no está disponible para esta invitación';
  END IF;

  v_today_monterrey := to_char(now() AT TIME ZONE 'America/Monterrey', 'YYYY-MM-DD');
  IF v_rsvp_deadline ~ '^\\d{4}-\\d{2}-\\d{2}$'
     AND v_today_monterrey > v_rsvp_deadline THEN
    RAISE EXCEPTION 'El plazo para confirmar terminó el %', v_rsvp_deadline;
  END IF;

  IF (p_attendance_status = 'attending' AND
      (p_party_size IS NULL OR p_party_size < 1 OR p_party_size > v_max_party_size))
     OR (p_attendance_status = 'declined' AND (p_party_size IS NULL OR p_party_size <> 0)) THEN
    RAISE EXCEPTION 'La cantidad de asistentes no es válida';
  END IF;

  v_edit_token := encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.rsvp_responses
    (invitation_id, guest_name, attendance_status, party_size, phone, edit_token_hash)
  VALUES
    (v_invitation_id, btrim(p_guest_name), p_attendance_status, p_party_size,
     nullif(btrim(p_phone), ''),
     encode(extensions.digest(convert_to(v_edit_token, 'UTF8'), 'sha256'), 'hex'))
  RETURNING id INTO v_response_id;

  RETURN QUERY SELECT v_response_id, v_edit_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.edit_invitation_rsvp(
  p_response_id uuid, p_edit_token text, p_guest_name text,
  p_attendance_status text, p_party_size integer, p_phone text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_max_party_size integer;
  v_rsvp_deadline text;
  v_today_monterrey text;
BEGIN
  IF p_edit_token IS NULL OR char_length(p_edit_token) <> 64
     OR p_edit_token !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  IF p_guest_name IS NULL OR char_length(btrim(p_guest_name)) NOT BETWEEN 1 AND 80
     OR (p_phone IS NOT NULL AND char_length(p_phone) > 30)
     OR p_attendance_status IS NULL
     OR p_attendance_status NOT IN ('attending', 'declined') THEN RETURN false; END IF;

  SELECT i.max_party_size, i.content_config->>'rsvp_deadline'
    INTO v_max_party_size, v_rsvp_deadline
  FROM public.rsvp_responses r
  JOIN public.invitations i ON i.id = r.invitation_id
  JOIN public.events e ON e.id = i.event_id
  WHERE r.id = p_response_id
    AND r.edit_token_hash = encode(extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex')
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true;

  IF v_max_party_size IS NULL THEN RETURN false; END IF;

  v_today_monterrey := to_char(now() AT TIME ZONE 'America/Monterrey', 'YYYY-MM-DD');
  IF v_rsvp_deadline ~ '^\\d{4}-\\d{2}-\\d{2}$'
     AND v_today_monterrey > v_rsvp_deadline THEN
    RETURN false;
  END IF;

  IF (p_attendance_status = 'attending' AND
      (p_party_size IS NULL OR p_party_size < 1 OR p_party_size > v_max_party_size))
     OR (p_attendance_status = 'declined' AND (p_party_size IS NULL OR p_party_size <> 0)) THEN
    RETURN false;
  END IF;

  UPDATE public.rsvp_responses
  SET guest_name = btrim(p_guest_name),
      attendance_status = p_attendance_status,
      party_size = p_party_size,
      phone = nullif(btrim(p_phone), ''),
      updated_at = now()
  WHERE id = p_response_id
    AND edit_token_hash = encode(extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex');

  RETURN FOUND;
END;
$function$;
