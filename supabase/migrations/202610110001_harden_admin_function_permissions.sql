-- Harden administrative RPC permissions without changing public gallery access.
-- Guest photo/message SELECT and INSERT policies are intentionally untouched.

-- This maintenance function is not called by the public application.
-- Keep it available to trusted server-side jobs only.
revoke all on function public.publish_upcoming_events() from public, anon, authenticated;
grant execute on function public.publish_upcoming_events() to service_role;

-- Aggregated event activity is used by the authenticated admin dashboard, not guests.
revoke all on function public.get_admin_event_stats() from public, anon;
grant execute on function public.get_admin_event_stats() to authenticated, service_role;

-- Admin-only deletion RPCs must never be callable anonymously.
-- Authenticated access remains for the existing admin UI, whose functions also
-- verify that a Supabase user session exists.
revoke all on function public.delete_photo_admin(uuid) from public, anon;
grant execute on function public.delete_photo_admin(uuid) to authenticated, service_role;

revoke all on function public.delete_photos_admin(uuid) from public, anon;
grant execute on function public.delete_photos_admin(uuid) to authenticated, service_role;
