-- Expose RSVP state in the organizer guest list without changing existing data.
CREATE OR REPLACE FUNCTION public.get_invitation_guests_with_rsvp_token(
  p_event_id uuid,
  p_organizer_token text
)
RETURNS TABLE (
  guest_id uuid,
  guest_name text,
  phone text,
  family_group text,
  passes integer,
  delivery_status text,
  sent_at timestamptz,
  created_at timestamptz,
  attendance_status text,
  party_size integer,
  rsvp_updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event_id AND e.organizer_token = p_organizer_token
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT g.id, g.name, g.phone, g.family_group, g.passes,
         g.delivery_status, g.sent_at, g.created_at,
         r.attendance_status, r.party_size, r.updated_at
  FROM public.invitation_guests g
  LEFT JOIN public.rsvp_responses r ON r.guest_id = g.id
  WHERE g.event_id = p_event_id
  ORDER BY lower(g.family_group), lower(g.name);
END;
$function$;

REVOKE ALL ON FUNCTION public.get_invitation_guests_with_rsvp_token(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_guests_with_rsvp_token(uuid, text) TO anon, authenticated, service_role;
