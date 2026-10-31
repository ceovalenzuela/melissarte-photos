-- Independent private invitation drafts. Additive only; does not touch existing events/invitations.
CREATE TABLE IF NOT EXISTS public.invitation_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_reference text NOT NULL UNIQUE,
  event_type text NOT NULL CHECK (event_type IN ('wedding','xv','baby_shower','baptism')),
  package text NOT NULL DEFAULT 'essential' CHECK (package IN ('essential','plus')),
  template_key text NOT NULL CHECK (template_key IN ('wedding_editorial','xv_gala','baby_soft','baptism_light')),
  design_config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(design_config) = 'object'),
  content_config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content_config) = 'object'),
  event_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','awaiting_payment','paid','editing_enabled','ready_to_publish','published','cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','rejected')),
  editing_enabled boolean NOT NULL DEFAULT false,
  whatsapp_confirmation_phone text,
  shopify_order_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invitation_draft_access (
  draft_id uuid PRIMARY KEY REFERENCES public.invitation_drafts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invitation_drafts_status_created_idx
  ON public.invitation_drafts(status, created_at DESC);

ALTER TABLE public.invitation_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_draft_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.invitation_drafts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.invitation_draft_access FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.invitation_drafts TO service_role;
GRANT ALL ON public.invitation_draft_access TO service_role;

CREATE OR REPLACE FUNCTION public.create_invitation_draft(
  p_event_type text,
  p_template_key text
)
RETURNS TABLE (draft_id uuid, draft_reference text, access_token text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_id uuid;
  v_reference text;
  v_token text;
BEGIN
  IF p_event_type NOT IN ('wedding','xv','baby_shower','baptism')
     OR p_template_key NOT IN ('wedding_editorial','xv_gala','baby_soft','baptism_light') THEN
    RAISE EXCEPTION 'Tipo de evento o plantilla no válido';
  END IF;
  IF (p_event_type = 'wedding' AND p_template_key <> 'wedding_editorial')
     OR (p_event_type = 'xv' AND p_template_key <> 'xv_gala')
     OR (p_event_type = 'baby_shower' AND p_template_key <> 'baby_soft')
     OR (p_event_type = 'baptism' AND p_template_key <> 'baptism_light') THEN
    RAISE EXCEPTION 'La plantilla no corresponde al tipo de evento';
  END IF;

  v_reference := 'ML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.invitation_drafts(draft_reference, event_type, template_key)
  VALUES (v_reference, p_event_type, p_template_key)
  RETURNING id INTO v_id;

  INSERT INTO public.invitation_draft_access(draft_id, token_hash)
  VALUES (v_id, encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex'));

  RETURN QUERY SELECT v_id, v_reference, v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_invitation_draft(p_access_token text)
RETURNS TABLE (
  draft_id uuid, draft_reference text, event_type text, package text,
  template_key text, design_config jsonb, content_config jsonb,
  event_date date, status text, payment_status text,
  editing_enabled boolean, whatsapp_confirmation_phone text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT d.id, d.draft_reference, d.event_type, d.package, d.template_key,
         d.design_config, d.content_config, d.event_date, d.status,
         d.payment_status, d.editing_enabled, d.whatsapp_confirmation_phone
  FROM public.invitation_drafts d
  JOIN public.invitation_draft_access a ON a.draft_id = d.id
  WHERE p_access_token ~ '^[a-f0-9]{64}$'
    AND a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex')
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.update_invitation_draft(
  p_access_token text,
  p_template_key text,
  p_design_config jsonb,
  p_content_config jsonb,
  p_event_date date
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_draft public.invitation_drafts%ROWTYPE;
  v_design jsonb;
  v_content jsonb;
BEGIN
  IF p_access_token IS NULL OR p_access_token !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  SELECT d.* INTO v_draft
  FROM public.invitation_drafts d
  JOIN public.invitation_draft_access a ON a.draft_id = d.id
  WHERE a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex')
  FOR UPDATE OF d;
  IF v_draft.id IS NULL OR v_draft.status NOT IN ('draft','awaiting_payment') THEN RETURN false; END IF;
  IF v_draft.payment_status <> 'pending' OR v_draft.editing_enabled THEN RETURN false; END IF;
  IF p_template_key NOT IN ('wedding_editorial','xv_gala','baby_soft','baptism_light') THEN RETURN false; END IF;
  IF (v_draft.event_type = 'wedding' AND p_template_key <> 'wedding_editorial')
     OR (v_draft.event_type = 'xv' AND p_template_key <> 'xv_gala')
     OR (v_draft.event_type = 'baby_shower' AND p_template_key <> 'baby_soft')
     OR (v_draft.event_type = 'baptism' AND p_template_key <> 'baptism_light') THEN RETURN false; END IF;

  -- Only the pre-payment design and content fields are accepted.
  v_design := jsonb_build_object(
    'cover_image_url', coalesce(p_design_config->'cover_image_url', v_draft.design_config->'cover_image_url')
  );
  v_content := '{}'::jsonb;
  IF p_content_config ? 'headline' THEN v_content := v_content || jsonb_build_object('headline', left(p_content_config->>'headline', 120)); END IF;
  IF p_content_config ? 'subtitle' THEN v_content := v_content || jsonb_build_object('subtitle', left(p_content_config->>'subtitle', 180)); END IF;
  IF p_content_config ? 'host_names' THEN v_content := v_content || jsonb_build_object('host_names', left(p_content_config->>'host_names', 160)); END IF;
  IF p_content_config ? 'event_label' THEN v_content := v_content || jsonb_build_object('event_label', left(p_content_config->>'event_label', 60)); END IF;
  IF p_content_config ? 'reception_title' THEN v_content := v_content || jsonb_build_object('reception_title', left(p_content_config->>'reception_title', 60)); END IF;
  IF p_content_config ? 'reception_time' THEN v_content := v_content || jsonb_build_object('reception_time', left(p_content_config->>'reception_time', 10)); END IF;
  IF p_content_config ? 'reception_venue' THEN v_content := v_content || jsonb_build_object('reception_venue', left(p_content_config->>'reception_venue', 160)); END IF;
  IF p_content_config ? 'reception_address' THEN v_content := v_content || jsonb_build_object('reception_address', left(p_content_config->>'reception_address', 240)); END IF;
  UPDATE public.invitation_drafts
  SET template_key = p_template_key,
      design_config = v_draft.design_config || v_design,
      content_config = v_draft.content_config || v_content,
      event_date = p_event_date,
      updated_at = now()
  WHERE id = v_draft.id;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_invitation_draft_package(
  p_access_token text,
  p_package text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF p_access_token IS NULL OR p_access_token !~ '^[a-f0-9]{64}$'
     OR p_package NOT IN ('essential','plus') THEN RETURN false; END IF;
  UPDATE public.invitation_drafts d
  SET package = p_package, status = 'awaiting_payment', updated_at = now()
  FROM public.invitation_draft_access a
  WHERE a.draft_id = d.id
    AND a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex')
    AND d.payment_status = 'pending'
    AND d.status IN ('draft','awaiting_payment')
    AND d.editing_enabled = false;
  RETURN FOUND;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_invitation_draft(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invitation_draft(text,text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_invitation_draft(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_draft(text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.update_invitation_draft(text,text,jsonb,jsonb,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_invitation_draft(text,text,jsonb,jsonb,date) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_invitation_draft_package(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_invitation_draft_package(text,text) TO anon, authenticated, service_role;
