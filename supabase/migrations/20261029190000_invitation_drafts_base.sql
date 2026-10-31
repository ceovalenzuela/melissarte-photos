-- Private pre-payment invitation drafts, independent from published events/invitations.
create table if not exists public.invitation_drafts (
  id uuid primary key default gen_random_uuid(),
  draft_reference text not null unique,
  event_type text not null check (event_type in ('wedding','xv','baby_shower','baptism')),
  package text not null default 'essential' check (package in ('essential','plus')),
  template_key text not null check (template_key in ('wedding_editorial','xv_gala','baby_soft','baptism_light')),
  design_config jsonb not null default '{}'::jsonb check (jsonb_typeof(design_config) = 'object'),
  content_config jsonb not null default '{}'::jsonb check (jsonb_typeof(content_config) = 'object'),
  event_date date,
  status text not null default 'draft' check (status in ('draft','awaiting_payment','paid','editing_enabled','published','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','rejected')),
  editing_enabled boolean not null default false,
  whatsapp_confirmation_phone text,
  shopify_order_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invitation_drafts_created_at_idx on public.invitation_drafts(created_at desc);
alter table public.invitation_drafts enable row level security;
revoke all on public.invitation_drafts from public, anon, authenticated;

create table if not exists public.invitation_draft_access (
  draft_id uuid primary key references public.invitation_drafts(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
alter table public.invitation_draft_access enable row level security;
revoke all on public.invitation_draft_access from public, anon, authenticated;

create or replace function public.create_invitation_draft(p_event_type text, p_template_key text)
returns table(access_token text, draft_reference text)
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_token text; v_ref text;
begin
  if p_event_type not in ('wedding','xv','baby_shower','baptism') then raise exception 'Tipo de evento no válido'; end if;
  if (p_event_type,p_template_key) not in (('wedding','wedding_editorial'),('xv','xv_gala'),('baby_shower','baby_soft'),('baptism','baptism_light')) then
    raise exception 'Plantilla no válida para el evento';
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

create or replace function public.get_invitation_draft(p_access_token text)
returns table(
 draft_id uuid,draft_reference text,event_type text,package text,template_key text,
 design_config jsonb,content_config jsonb,event_date date,status text,
 payment_status text,editing_enabled boolean
)
language sql stable security definer set search_path = ''
as $$
 select d.id,d.draft_reference,d.event_type,d.package,d.template_key,d.design_config,
        d.content_config,d.event_date,d.status,d.payment_status,d.editing_enabled
 from public.invitation_drafts d
 join public.invitation_draft_access a on a.draft_id=d.id
 where p_access_token ~ '^[a-f0-9]{64}$'
   and a.token_hash=encode(extensions.digest(convert_to(p_access_token,'UTF8'),'sha256'),'hex')
 limit 1;
$$;
revoke all on function public.get_invitation_draft(text) from public;
grant execute on function public.get_invitation_draft(text) to anon, authenticated;

create or replace function public.set_invitation_draft_package(p_access_token text,p_package text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
 if p_package not in ('essential','plus') or p_access_token !~ '^[a-f0-9]{64}$' then return false; end if;
 update public.invitation_drafts d set package=p_package,status='awaiting_payment',updated_at=now()
 from public.invitation_draft_access a
 where a.draft_id=d.id and a.token_hash=encode(extensions.digest(convert_to(p_access_token,'UTF8'),'sha256'),'hex')
 and d.payment_status='pending' and d.status in ('draft','awaiting_payment')
 returning d.id into v_id;
 return v_id is not null;
end;
$$;
revoke all on function public.set_invitation_draft_package(text,text) from public;
grant execute on function public.set_invitation_draft_package(text,text) to anon, authenticated;
