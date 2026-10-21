-- Personalized invitation links and RSVP integration. Additive only.
ALTER TABLE public.invitation_guests ADD COLUMN IF NOT EXISTS guest_token text UNIQUE;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS guest_id uuid REFERENCES public.invitation_guests(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS rsvp_responses_guest_id_unique ON public.rsvp_responses(guest_id) WHERE guest_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_or_create_invitation_guest_link(p_event_id uuid,p_organizer_token text,p_guest_id uuid)
RETURNS TABLE(guest_token text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $function$
DECLARE v_token text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events e WHERE e.id=p_event_id AND e.organizer_token=p_organizer_token) THEN RAISE EXCEPTION 'No autorizado'; END IF;
 UPDATE public.invitation_guests g SET guest_token=coalesce(g.guest_token,encode(extensions.gen_random_bytes(32),'hex')),updated_at=now()
 WHERE g.id=p_guest_id AND g.event_id=p_event_id RETURNING g.guest_token INTO v_token;
 IF v_token IS NULL THEN RAISE EXCEPTION 'Invitado no encontrado'; END IF;
 RETURN QUERY SELECT v_token;
END;$function$;

CREATE OR REPLACE FUNCTION public.get_public_invitation_guest(p_invitation_slug text,p_guest_token text)
RETURNS TABLE(guest_id uuid,guest_name text,phone text,passes integer,response_id uuid,attendance_status text,party_size integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $function$
 SELECT g.id,g.name,g.phone,g.passes,r.id,r.attendance_status,r.party_size
 FROM public.invitation_guests g JOIN public.invitations i ON i.event_id=g.event_id
 LEFT JOIN public.rsvp_responses r ON r.guest_id=g.id
 WHERE i.slug=p_invitation_slug AND i.status='published' AND i.rsvp_enabled=true AND g.guest_token=p_guest_token
 LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.submit_invitation_guest_rsvp(
 p_invitation_slug text,p_guest_token text,p_guest_name text,p_attendance_status text,p_party_size integer,p_phone text DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $function$
DECLARE v_guest_id uuid; v_invitation_id uuid; v_passes integer; v_response_id uuid;
BEGIN
 IF p_guest_name IS NULL OR char_length(btrim(p_guest_name)) NOT BETWEEN 1 AND 80
 OR (p_phone IS NOT NULL AND char_length(p_phone)>30) OR p_attendance_status NOT IN ('attending','declined') THEN
  RAISE EXCEPTION 'Revisa los datos de tu confirmación';
 END IF;
 SELECT g.id,i.id,g.passes INTO v_guest_id,v_invitation_id,v_passes
 FROM public.invitation_guests g JOIN public.invitations i ON i.event_id=g.event_id
 WHERE i.slug=p_invitation_slug AND i.status='published' AND i.rsvp_enabled=true AND g.guest_token=p_guest_token
 FOR UPDATE OF g;
 IF v_guest_id IS NULL THEN RAISE EXCEPTION 'Este enlace personalizado no está disponible'; END IF;
 IF (p_attendance_status='attending' AND (p_party_size IS NULL OR p_party_size<1 OR p_party_size>v_passes))
 OR (p_attendance_status='declined' AND coalesce(p_party_size,-1)<>0) THEN
  RAISE EXCEPTION 'La cantidad de personas supera los pases asignados';
 END IF;
 SELECT r.id INTO v_response_id FROM public.rsvp_responses r WHERE r.guest_id=v_guest_id LIMIT 1;
 IF v_response_id IS NULL THEN
  INSERT INTO public.rsvp_responses(invitation_id,guest_id,guest_name,attendance_status,party_size,phone,edit_token_hash)
  VALUES(v_invitation_id,v_guest_id,btrim(p_guest_name),p_attendance_status,p_party_size,nullif(btrim(p_phone),''),
   encode(extensions.digest(convert_to(encode(extensions.gen_random_bytes(32),'hex'),'UTF8'),'sha256'),'hex'));
 ELSE
  UPDATE public.rsvp_responses SET guest_name=btrim(p_guest_name),attendance_status=p_attendance_status,
   party_size=p_party_size,phone=nullif(btrim(p_phone),''),updated_at=now() WHERE id=v_response_id;
 END IF;
 RETURN true;
END;$function$;

REVOKE ALL ON FUNCTION public.get_or_create_invitation_guest_link(uuid,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_invitation_guest_link(uuid,text,uuid) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.get_public_invitation_guest(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_invitation_guest(text,text) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.submit_invitation_guest_rsvp(text,text,text,text,integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invitation_guest_rsvp(text,text,text,text,integer,text) TO anon,authenticated,service_role;
