-- Guest Center: additive guest list for digital invitations.
-- Not applied automatically. Organizer operations are scoped to the existing organizer token.

CREATE TABLE IF NOT EXISTS public.invitation_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  family_group text NOT NULL DEFAULT '',
  passes integer NOT NULL DEFAULT 1 CHECK (passes BETWEEN 1 AND 20),
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent')),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invitation_guests_event_group_idx
  ON public.invitation_guests (event_id, family_group, name);
ALTER TABLE public.invitation_guests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.invitation_guests FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.invitation_guests TO service_role;

CREATE OR REPLACE FUNCTION public.get_invitation_guests_with_token(p_event_id uuid, p_organizer_token text)
RETURNS TABLE (guest_id uuid, guest_name text, phone text, family_group text, passes integer, delivery_status text, sent_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT g.id, g.name, g.phone, g.family_group, g.passes, g.delivery_status, g.sent_at, g.created_at
    FROM public.invitation_guests g WHERE g.event_id = p_event_id
    ORDER BY lower(g.family_group), lower(g.name);
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_invitation_guest_with_token(
  p_event_id uuid, p_organizer_token text, p_guest_id uuid DEFAULT NULL,
  p_name text DEFAULT '', p_phone text DEFAULT '', p_family_group text DEFAULT '',
  p_passes integer DEFAULT 1
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE v_id uuid; v_phone text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_name IS NULL OR char_length(btrim(p_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'El nombre debe tener entre 1 y 120 caracteres';
  END IF;
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  IF char_length(v_phone) NOT BETWEEN 7 AND 30 THEN RAISE EXCEPTION 'Revisa el teléfono'; END IF;
  IF p_passes IS NULL OR p_passes NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Los pases deben estar entre 1 y 20'; END IF;
  IF p_family_group IS NOT NULL AND char_length(p_family_group) > 100 THEN RAISE EXCEPTION 'El grupo familiar es demasiado largo'; END IF;

  IF p_guest_id IS NOT NULL THEN
    UPDATE public.invitation_guests g
      SET name = btrim(p_name), phone = v_phone, family_group = btrim(coalesce(p_family_group, '')),
          passes = p_passes, updated_at = now()
      WHERE g.id = p_guest_id AND g.event_id = p_event_id
      RETURNING g.id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Invitado no encontrado'; END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM public.invitation_guests g WHERE g.event_id = p_event_id AND regexp_replace(g.phone, '[^0-9]', '', 'g') = regexp_replace(v_phone, '[^0-9]', '', 'g')) THEN
      RAISE EXCEPTION 'Ya existe un invitado con ese teléfono';
    END IF;
    INSERT INTO public.invitation_guests(event_id, name, phone, family_group, passes)
      VALUES (p_event_id, btrim(p_name), v_phone, btrim(coalesce(p_family_group, '')), p_passes)
      RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_invitation_guest_delivery_status(
  p_event_id uuid, p_organizer_token text, p_guest_id uuid, p_status text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_status NOT IN ('pending', 'sent') THEN RAISE EXCEPTION 'Estado no válido'; END IF;
  UPDATE public.invitation_guests
    SET delivery_status = p_status, sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE NULL END, updated_at = now()
    WHERE id = p_guest_id AND event_id = p_event_id;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_invitation_guest_with_token(p_event_id uuid, p_organizer_token text, p_guest_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM public.invitation_guests WHERE id = p_guest_id AND event_id = p_event_id;
  RETURN FOUND;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_invitation_guests_with_token(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_guests_with_token(uuid, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.save_invitation_guest_with_token(uuid, text, uuid, text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_invitation_guest_with_token(uuid, text, uuid, text, text, text, integer) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_invitation_guest_delivery_status(uuid, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_invitation_guest_delivery_status(uuid, text, uuid, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.delete_invitation_guest_with_token(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_invitation_guest_with_token(uuid, text, uuid) TO anon, authenticated, service_role;
