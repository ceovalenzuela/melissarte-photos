-- Allow 1-99 assigned passes and validate phone numbers as a local 10-digit
-- number or an international country code plus 10 national digits.
-- Existing guest and RSVP records are preserved.

ALTER TABLE public.invitation_guests
  DROP CONSTRAINT IF EXISTS invitation_guests_passes_check;

ALTER TABLE public.invitation_guests
  ADD CONSTRAINT invitation_guests_passes_check CHECK (passes BETWEEN 1 AND 99);

CREATE OR REPLACE FUNCTION public.save_invitation_guest_with_token(
  p_event_id uuid,
  p_organizer_token text,
  p_guest_id uuid DEFAULT NULL,
  p_name text DEFAULT '',
  p_phone text DEFAULT '',
  p_family_group text DEFAULT '',
  p_passes integer DEFAULT 1
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_id uuid;
  v_phone text;
  v_phone_digits text;
  v_confirmed_party_size integer;
  v_attendance_status text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_name IS NULL OR char_length(btrim(p_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'El nombre debe tener entre 1 y 120 caracteres';
  END IF;

  v_phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  IF char_length(v_phone_digits) NOT IN (10, 11, 12, 13, 14, 15) THEN
    RAISE EXCEPTION 'El teléfono debe tener 10 dígitos locales o lada internacional más 10 dígitos';
  END IF;
  -- Preserve legacy ten-digit entries as Mexican numbers when saving.
  IF char_length(v_phone_digits) = 10 THEN
    v_phone := '52' || v_phone_digits;
  ELSE
    v_phone := v_phone_digits;
  END IF;

  IF p_passes IS NULL OR p_passes NOT BETWEEN 1 AND 99 THEN
    RAISE EXCEPTION 'Los pases deben estar entre 1 y 99';
  END IF;
  IF p_family_group IS NOT NULL AND char_length(p_family_group) > 100 THEN
    RAISE EXCEPTION 'El grupo familiar es demasiado largo';
  END IF;

  IF p_guest_id IS NOT NULL THEN
    PERFORM 1
    FROM public.invitation_guests g
    WHERE g.id = p_guest_id AND g.event_id = p_event_id
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invitado no encontrado';
    END IF;

    SELECT r.attendance_status, r.party_size
      INTO v_attendance_status, v_confirmed_party_size
    FROM public.rsvp_responses r
    WHERE r.guest_id = p_guest_id
    LIMIT 1;

    IF v_attendance_status = 'attending'
       AND v_confirmed_party_size > p_passes THEN
      RAISE EXCEPTION 'No puedes asignar menos pases que las personas ya confirmadas. Actualiza primero la confirmación o conserva al menos % pases.', v_confirmed_party_size;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invitation_guests g
    WHERE g.event_id = p_event_id
      AND (
        CASE
          WHEN char_length(regexp_replace(g.phone, '[^0-9]', '', 'g')) = 10
            THEN '52' || regexp_replace(g.phone, '[^0-9]', '', 'g')
          ELSE regexp_replace(g.phone, '[^0-9]', '', 'g')
        END
      ) = v_phone
      AND (p_guest_id IS NULL OR g.id <> p_guest_id)
  ) THEN
    RAISE EXCEPTION 'Ya existe un invitado con ese teléfono';
  END IF;

  IF p_guest_id IS NOT NULL THEN
    UPDATE public.invitation_guests g
      SET name = btrim(p_name),
          phone = v_phone,
          family_group = btrim(coalesce(p_family_group, '')),
          passes = p_passes,
          updated_at = now()
      WHERE g.id = p_guest_id AND g.event_id = p_event_id
      RETURNING g.id INTO v_id;
  ELSE
    INSERT INTO public.invitation_guests(event_id, name, phone, family_group, passes)
      VALUES (p_event_id, btrim(p_name), v_phone, btrim(coalesce(p_family_group, '')), p_passes)
      RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.save_invitation_guest_with_token(uuid, text, uuid, text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_invitation_guest_with_token(uuid, text, uuid, text, text, text, integer) TO anon, authenticated, service_role;
