-- Remove table-level privileges that are not needed by the application API.
-- Row-level security does not protect against TRUNCATE, and clients should not
-- be able to create triggers or foreign-key references on application tables.
REVOKE TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.events, public.photos, public.messages
FROM anon, authenticated;
