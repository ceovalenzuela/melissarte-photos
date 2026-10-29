-- Persist only the allowed pre-payment visual fields, including the selected preset palette.
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
  IF v_draft.id IS NULL OR v_draft.status NOT IN ('draft','awaiting_payment') THEN RETURN false; END IF;
  IF v_draft.payment_status <> 'pending' OR v_draft.editing_enabled THEN RETURN false; END IF;
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
