-- Reduce abandoned unpaid invitation draft retention from 30 to 15 days.
create or replace function public.expire_abandoned_invitation_drafts()
returns table (draft_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.invitation_drafts as d
  set status = 'cancelled',
      expired_at = coalesce(d.expired_at, now())
  where d.payment_status = 'pending'
    and coalesce(d.editing_enabled, false) = false
    and (
      (d.expired_at is null
       and d.status in ('draft', 'awaiting_payment')
       and d.updated_at < now() - interval '15 days')
      or (d.expired_at is not null and d.status = 'cancelled')
    )
  returning d.id;
end;
$$;

revoke all on function public.expire_abandoned_invitation_drafts() from public, anon, authenticated;
grant execute on function public.expire_abandoned_invitation_drafts() to service_role;
