-- Allow only authenticated administrators to remove event photo objects.
-- The browser admin photo manager removes Storage objects before deleting
-- the corresponding public.photos row. Without this policy, Storage can
-- return a successful empty deletion while leaving the files behind.

begin;

drop policy if exists "Admins can delete event photos" on storage.objects;
create policy "Admins can delete event photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-photos'
  and public.is_admin_user()
);

commit;
