-- Admin authorization and manual payment/edition workflow for private invitation drafts.
CREATE OR REPLACE FUNCTION public.is_invitation_draft_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE a.user_id = (SELECT auth.uid())
  );
$function$;
REVOKE ALL ON FUNCTION public.is_invitation_draft_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_invitation_draft_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_invitation_drafts()
RETURNS TABLE (
  draft_id uuid, draft_reference text, event_type text, package text,
  template_key text, content_config jsonb, event_date date, status text,
  payment_status text, editing_enabled boolean, whatsapp_confirmation_phone text,
  shopify_order_name text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT public.is_invitation_draft_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
  SELECT d.id, d.draft_reference, d.event_type, d.package, d.template_key,
         d.content_config, d.event_date, d.status, d.payment_status,
         d.editing_enabled, d.whatsapp_confirmation_phone, d.shopify_order_name,
         d.created_at, d.updated_at
  FROM public.invitation_drafts d
  WHERE d.status <> 'cancelled'
  ORDER BY d.created_at DESC;
END;
$function$;
REVOKE ALL ON FUNCTION public.admin_list_invitation_drafts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_invitation_drafts() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_invitation_draft(
  p_draft_id uuid,
  p_payment_status text,
  p_editing_enabled boolean,
  p_whatsapp_phone text,
  p_shopify_order_name text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT public.is_invitation_draft_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF p_payment_status NOT IN ('pending','paid','rejected') THEN RAISE EXCEPTION 'Estado de pago no válido'; END IF;
  IF p_editing_enabled AND p_payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Solo se puede habilitar la edición después de validar el pago';
  END IF;
  IF p_whatsapp_phone IS NOT NULL AND length(p_whatsapp_phone) > 30 THEN
    RAISE EXCEPTION 'El teléfono de WhatsApp es demasiado largo';
  END IF;
  UPDATE public.invitation_drafts
  SET payment_status = p_payment_status,
      editing_enabled = p_editing_enabled,
      whatsapp_confirmation_phone = nullif(btrim(p_whatsapp_phone), ''),
      shopify_order_name = nullif(left(btrim(coalesce(p_shopify_order_name,'')), 80), ''),
      status = CASE
        WHEN p_payment_status = 'rejected' THEN 'draft'
        WHEN p_payment_status = 'pending' THEN 'awaiting_payment'
        WHEN p_editing_enabled THEN 'editing_enabled'
        ELSE 'paid'
      END,
      updated_at = now()
  WHERE id = p_draft_id
    AND status <> 'published';
  RETURN FOUND;
END;
$function$;
REVOKE ALL ON FUNCTION public.admin_update_invitation_draft(uuid,text,boolean,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_invitation_draft(uuid,text,boolean,text,text) TO authenticated;

-- After payment, the same narrow public-facing editor may save its approved fields.
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
  v_key text;
BEGIN
  IF p_access_token IS NULL OR p_access_token !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  SELECT d.* INTO v_draft
  FROM public.invitation_drafts d
  JOIN public.invitation_draft_access a ON a.draft_id = d.id
  WHERE a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex')
  FOR UPDATE OF d;
  IF v_draft.id IS NULL OR v_draft.status NOT IN ('draft','awaiting_payment','editing_enabled') THEN RETURN false; END IF;
  IF v_draft.payment_status = 'rejected' THEN RETURN false; END IF;
  IF v_draft.payment_status = 'paid' AND NOT v_draft.editing_enabled THEN RETURN false; END IF;
  IF v_draft.payment_status = 'pending' AND v_draft.editing_enabled THEN RETURN false; END IF;
  IF p_template_key NOT IN ('wedding_editorial','xv_gala','baby_soft','baptism_light') THEN RETURN false; END IF;
  IF (v_draft.event_type = 'wedding' AND p_template_key <> 'wedding_editorial')
     OR (v_draft.event_type = 'xv' AND p_template_key <> 'xv_gala')
     OR (v_draft.event_type = 'baby_shower' AND p_template_key <> 'baby_soft')
     OR (v_draft.event_type = 'baptism' AND p_template_key <> 'baptism_light') THEN RETURN false; END IF;
  IF jsonb_typeof(coalesce(p_design_config, '{}'::jsonb)) <> 'object'
     OR jsonb_typeof(coalesce(p_content_config, '{}'::jsonb)) <> 'object' THEN RETURN false; END IF;

  v_design := '{}'::jsonb;
  FOREACH v_key IN ARRAY ARRAY[
    'cover_image_url','background_color','accent_color','text_color','title_color',
    'card_background_color','card_text_color','border_color','button_color',
    'button_text_color','rsvp_background_color','rsvp_text_color',
    'form_background_color','form_text_color'
  ] LOOP
    IF p_design_config ? v_key THEN
      IF v_key = 'cover_image_url' THEN
        IF p_design_config->>v_key IS NOT NULL AND length(p_design_config->>v_key) > 1000 THEN RETURN false; END IF;
      ELSIF p_design_config->>v_key !~ '^#[0-9A-Fa-f]{6}$' THEN
        RETURN false;
      END IF;
      v_design := v_design || jsonb_build_object(v_key, p_design_config->v_key);
    END IF;
  END LOOP;

  v_content := '{}'::jsonb;
  FOREACH v_key IN ARRAY ARRAY[
    'headline','subtitle','host_names','event_label','reception_title',
    'reception_time','reception_venue','reception_address'
  ] LOOP
    IF p_content_config ? v_key THEN
      v_content := v_content || jsonb_build_object(v_key,
        left(coalesce(p_content_config->>v_key,''), CASE v_key
          WHEN 'headline' THEN 120 WHEN 'subtitle' THEN 180
          WHEN 'host_names' THEN 160 WHEN 'event_label' THEN 60
          WHEN 'reception_title' THEN 60 WHEN 'reception_time' THEN 10
          WHEN 'reception_venue' THEN 160 ELSE 240 END));
    END IF;
  END LOOP;

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
REVOKE ALL ON FUNCTION public.update_invitation_draft(text,text,jsonb,jsonb,date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_invitation_draft(text,text,jsonb,jsonb,date) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.update_invitation_draft(text,text,jsonb,jsonb,date) TO anon, authenticated;
