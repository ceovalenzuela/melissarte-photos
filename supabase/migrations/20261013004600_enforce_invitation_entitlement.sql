-- Enforce the invitation product flag at every invitation/RSVP RPC boundary.
CREATE OR REPLACE FUNCTION public.get_public_invitation_by_slug(p_slug text)
RETURNS TABLE (
  invitation_id uuid, event_id uuid, event_title text, event_date date,
  event_type text, event_slug text, invitation_slug text, template_key text,
  design_config jsonb, content_config jsonb, rsvp_enabled boolean,
  max_party_size integer, invitation_status text, cover_image text,
  cover_position_y integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT i.id, e.id, e.title, e.event_date, e.type, e.slug, i.slug,
         i.template_key, i.design_config, i.content_config, i.rsvp_enabled,
         i.max_party_size, i.status, e.cover_image, e.cover_position_y
  FROM public.invitations i
  JOIN public.events e ON e.id = i.event_id
  WHERE i.slug = p_slug
    AND i.status = 'published'
    AND e.invitation_enabled = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_invitation_for_organizer(
  p_event_id uuid, p_organizer_token text
)
RETURNS TABLE (
  invitation_id uuid, event_id uuid, slug text, template_key text,
  design_config jsonb, content_config jsonb, rsvp_enabled boolean,
  max_party_size integer, status text, created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT i.id, i.event_id, i.slug, i.template_key, i.design_config,
         i.content_config, i.rsvp_enabled, i.max_party_size, i.status,
         i.created_at, i.updated_at
  FROM public.invitations i
  JOIN public.events e ON e.id = i.event_id
  WHERE e.id = p_event_id
    AND e.organizer_token = p_organizer_token
    AND e.invitation_enabled = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.save_invitation_with_token(
  p_event_id uuid, p_organizer_token text, p_slug text, p_template_key text,
  p_design_config jsonb DEFAULT '{}'::jsonb,
  p_content_config jsonb DEFAULT '{}'::jsonb,
  p_rsvp_enabled boolean DEFAULT true,
  p_max_party_size integer DEFAULT 2,
  p_status text DEFAULT 'draft'
)
RETURNS TABLE (invitation_id uuid, invitation_slug text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE v_id uuid;
BEGIN
  IF p_event_id IS NULL OR p_organizer_token IS NULL
     OR char_length(p_organizer_token) < 22
     OR p_organizer_token !~ '^[A-Za-z0-9_-]+$' THEN
    RAISE EXCEPTION 'Datos de autorización no válidos';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id
      AND e.organizer_token = p_organizer_token
      AND e.invitation_enabled = true
  ) THEN
    RAISE EXCEPTION 'La invitación digital no está habilitada para este evento';
  END IF;
  IF p_slug IS NULL OR char_length(p_slug) > 100
     OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'El enlace de la invitación no es válido';
  END IF;
  IF p_template_key IS NULL OR p_template_key !~ '^[a-z0-9_-]{1,60}$' THEN
    RAISE EXCEPTION 'La plantilla no es válida';
  END IF;
  IF jsonb_typeof(coalesce(p_design_config, '{}'::jsonb)) <> 'object'
     OR jsonb_typeof(coalesce(p_content_config, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'La configuración debe ser un objeto JSON';
  END IF;
  IF p_max_party_size IS NULL OR p_max_party_size NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'El máximo de asistentes debe estar entre 1 y 20';
  END IF;
  IF p_status IS NULL OR p_status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Estado de invitación no válido';
  END IF;
  INSERT INTO public.invitations AS current_invitation
    (event_id, slug, template_key, design_config, content_config,
     rsvp_enabled, max_party_size, status, updated_at)
  VALUES
    (p_event_id, p_slug, p_template_key, coalesce(p_design_config, '{}'::jsonb),
     coalesce(p_content_config, '{}'::jsonb), coalesce(p_rsvp_enabled, true),
     p_max_party_size, p_status, now())
  ON CONFLICT (event_id) DO UPDATE SET
    slug = EXCLUDED.slug,
    template_key = EXCLUDED.template_key,
    design_config = EXCLUDED.design_config,
    content_config = EXCLUDED.content_config,
    rsvp_enabled = EXCLUDED.rsvp_enabled,
    max_party_size = EXCLUDED.max_party_size,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING current_invitation.id INTO v_id;
  RETURN QUERY SELECT v_id, p_slug;
END;
$function$;

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
  SELECT i.id, i.max_party_size INTO v_invitation_id, v_max_party_size
  FROM public.invitations i
  JOIN public.events e ON e.id = i.event_id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true;
  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'La confirmación no está disponible para esta invitación';
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
DECLARE v_max_party_size integer;
BEGIN
  IF p_edit_token IS NULL OR char_length(p_edit_token) <> 64
     OR p_edit_token !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  IF p_guest_name IS NULL OR char_length(btrim(p_guest_name)) NOT BETWEEN 1 AND 80
     OR (p_phone IS NOT NULL AND char_length(p_phone) > 30)
     OR p_attendance_status IS NULL
     OR p_attendance_status NOT IN ('attending', 'declined') THEN RETURN false; END IF;
  SELECT i.max_party_size INTO v_max_party_size
  FROM public.rsvp_responses r
  JOIN public.invitations i ON i.id = r.invitation_id
  JOIN public.events e ON e.id = i.event_id
  WHERE r.id = p_response_id
    AND r.edit_token_hash = encode(extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex')
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true;
  IF v_max_party_size IS NULL THEN RETURN false; END IF;
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

CREATE OR REPLACE FUNCTION public.get_invitation_rsvp_for_edit(
  p_invitation_slug text, p_response_id uuid, p_edit_token text
)
RETURNS TABLE (
  response_id uuid, guest_name text, attendance_status text,
  party_size integer, phone text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT r.id, r.guest_name, r.attendance_status, r.party_size, r.phone
  FROM public.rsvp_responses r
  JOIN public.invitations i ON i.id = r.invitation_id
  JOIN public.events e ON e.id = i.event_id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND e.invitation_enabled = true
    AND r.id = p_response_id
    AND p_edit_token ~ '^[a-f0-9]{64}$'
    AND r.edit_token_hash = encode(
      extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex'
    )
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_invitation_rsvps_with_token(
  p_event_id uuid, p_organizer_token text
)
RETURNS TABLE (
  response_id uuid, guest_name text, attendance_status text,
  party_size integer, phone text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT r.id, r.guest_name, r.attendance_status, r.party_size,
         r.phone, r.created_at, r.updated_at
  FROM public.rsvp_responses r
  JOIN public.invitations i ON i.id = r.invitation_id
  JOIN public.events e ON e.id = i.event_id
  WHERE e.id = p_event_id
    AND e.organizer_token = p_organizer_token
    AND e.invitation_enabled = true
  ORDER BY r.created_at DESC;
$function$;
