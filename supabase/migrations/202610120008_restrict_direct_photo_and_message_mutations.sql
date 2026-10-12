-- Keep guest write flows, but remove direct row mutation privileges that
-- are not part of the supported client API. Admin message deletion remains
-- available to authenticated admins through its RLS policy.
REVOKE UPDATE, DELETE ON TABLE public.photos FROM anon, authenticated;
REVOKE UPDATE, DELETE ON TABLE public.messages FROM anon;
