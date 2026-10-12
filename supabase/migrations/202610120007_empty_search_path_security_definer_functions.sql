-- Harden all SECURITY DEFINER functions against search_path shadowing.
-- Their table/function references are schema-qualified (public.*, auth.uid(),
-- realtime.send), so an empty search_path is safe and removes implicit lookup.
ALTER FUNCTION public.broadcast_photo_deleted() SET search_path = '';
ALTER FUNCTION public.delete_message_record_with_token(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.delete_message_with_token(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.delete_photo_admin(uuid) SET search_path = '';
ALTER FUNCTION public.delete_photo_record_with_token(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.delete_photo_with_token(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.delete_photos_admin(uuid) SET search_path = '';
ALTER FUNCTION public.get_admin_event_stats() SET search_path = '';
ALTER FUNCTION public.get_event_by_organizer_token(text) SET search_path = '';
ALTER FUNCTION public.get_event_messages_enabled(text) SET search_path = '';
ALTER FUNCTION public.get_public_event_by_slug(text) SET search_path = '';
ALTER FUNCTION public.is_admin_user() SET search_path = '';
ALTER FUNCTION public.is_published_event(uuid) SET search_path = '';
ALTER FUNCTION public.publish_upcoming_events() SET search_path = '';
ALTER FUNCTION public.update_event_cover_with_token(uuid, text, text) SET search_path = '';
ALTER FUNCTION public.update_event_with_token(uuid, text, text) SET search_path = '';
