-- Organizer deletion now goes through the token-validating Edge Functions.
-- Remove direct RPC access to legacy SECURITY DEFINER deletion helpers so clients cannot bypass
-- the storage-path checks performed by delete-photo-with-token / delete-message-with-token.

REVOKE EXECUTE ON FUNCTION public.delete_photo_record_with_token(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_photo_with_token(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_message_record_with_token(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_message_with_token(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
