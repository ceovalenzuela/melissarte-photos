CREATE OR REPLACE FUNCTION public.get_event_invitation_enabled(p_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT coalesce((
    SELECT e.invitation_enabled
    FROM public.events e
    WHERE e.organizer_token = p_token
    LIMIT 1
  ), false);
$function$;

REVOKE ALL ON FUNCTION public.get_event_invitation_enabled(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_invitation_enabled(text) TO anon, authenticated, service_role;
