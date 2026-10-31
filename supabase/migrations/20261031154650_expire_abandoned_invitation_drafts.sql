-- Expire abandoned unpaid invitation drafts after 30 days.
alter table public.invitation_drafts add column if not exists expired_at timestamptz;
