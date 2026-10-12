-- Security hardening: this function is intended to run only as a trigger.
-- Revoking direct RPC execution does not prevent the trigger from invoking it.
REVOKE EXECUTE ON FUNCTION public.broadcast_photo_deleted() FROM PUBLIC, anon, authenticated;
