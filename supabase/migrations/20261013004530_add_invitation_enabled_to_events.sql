ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS invitation_enabled boolean NOT NULL DEFAULT false;
