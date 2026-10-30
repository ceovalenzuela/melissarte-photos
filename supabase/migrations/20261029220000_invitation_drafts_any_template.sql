-- Allow any of the ten visual styles for every event type.
alter table public.invitation_drafts
  drop constraint if exists invitation_drafts_template_key_check;

alter table public.invitation_drafts
  add constraint invitation_drafts_template_key_check
  check (template_key in (
    'wedding_editorial','xv_gala','baby_soft','baptism_light',
    'botanical','noir','pink_atelier','celestial','cloud','garden'
  ));

create or replace function public.create_invitation_draft(p_event_type text, p_template_key text)
returns table(access_token text, draft_reference text)
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_token text; v_ref text;
begin
  if p_event_type not in ('wedding','xv','baby_shower','baptism') then
    raise exception 'Tipo de evento no válido';
  end if;
  if p_template_key not in (
    'wedding_editorial','xv_gala','baby_soft','baptism_light',
    'botanical','noir','pink_atelier','celestial','cloud','garden'
  ) then
    raise exception 'Plantilla no válida';
  end if;
  v_token := encode(extensions.gen_random_bytes(32),'hex');
  v_ref := 'ME-' || upper(substr(encode(extensions.gen_random_bytes(5),'hex'),1,10));
  insert into public.invitation_drafts(draft_reference,event_type,template_key)
    values(v_ref,p_event_type,p_template_key) returning id into v_id;
  insert into public.invitation_draft_access(draft_id,token_hash)
    values(v_id,encode(extensions.digest(convert_to(v_token,'UTF8'),'sha256'),'hex'));
  return query select v_token,v_ref;
end;
$$;
revoke all on function public.create_invitation_draft(text,text) from public;
grant execute on function public.create_invitation_draft(text,text) to anon, authenticated;
