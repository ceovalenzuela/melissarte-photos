-- Messages are created by guests and deleted by organizers/admins through
-- validated flows; direct row updates are not part of the client API.
REVOKE UPDATE ON TABLE public.messages FROM authenticated;
