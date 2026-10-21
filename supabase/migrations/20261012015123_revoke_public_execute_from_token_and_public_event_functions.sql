-- Remove inherited PUBLIC execution while preserving explicit API-role access.
-- Token validation remains inside each function; anon/authenticated access is still required by the app.
REVOKE EXECUTE ON FUNCTION public.delete_photo_record_with_token(uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_photo_with_token(uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_event_by_slug(text) FROM PUBLIC;
