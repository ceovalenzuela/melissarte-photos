-- Allow a guest to retrieve only their own RSVP using its edit token.
CREATE OR REPLACE FUNCTION public.get_invitation_rsvp_for_edit(
  p_invitation_slug text,
  p_response_id uuid,
  p_edit_token text
)
RETURNS TABLE (
  response_id uuid,
  guest_name text,
  attendance_status text,
  party_size integer,
  phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT r.id, r.guest_name, r.attendance_status, r.party_size, r.phone
  FROM public.rsvp_responses r
  JOIN public.invitations i ON i.id = r.invitation_id
  WHERE i.slug = p_invitation_slug
    AND i.status = 'published'
    AND i.rsvp_enabled = true
    AND r.id = p_response_id
    AND p_edit_token ~ '^[a-f0-9]{64}$'
    AND r.edit_token_hash = encode(
      extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'),
      'hex'
    )
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_invitation_rsvp_for_edit(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_rsvp_for_edit(text, uuid, text) TO anon, authenticated, service_role;
