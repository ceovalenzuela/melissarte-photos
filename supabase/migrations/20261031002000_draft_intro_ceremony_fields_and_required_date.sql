-- Persist the generic introduction and sample ceremony fields used by draft previews.
-- A date is required before a draft can be saved or advanced to checkout.
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
  IF p_access_token IS NULL OR p_access_token !~ '^[a-f0-9]{64}$' OR p_event_date IS NULL THEN RETURN false; END IF;
  SELECT d.* INTO v_draft
  FROM public.invitation_drafts d
  JOIN public.invitation_draft_access a ON a.draft_id = d.id
  WHERE a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex')
  FOR UPDATE OF d;
  IF v_draft.id IS NULL OR v_draft.status NOT IN ('draft','awaiting_payment','editing_enabled') THEN RETURN false; END IF;
  IF v_draft.payment_status = 'rejected' THEN RETURN false; END IF;
  IF v_draft.payment_status = 'paid' AND NOT v_draft.editing_enabled THEN RETURN false; END IF;
  IF v_draft.payment_status = 'pending' AND v_draft.editing_enabled THEN RETURN false; END IF;
  IF p_template_key NOT IN (
    'wedding_editorial','maison_botanique','noir_champagne','velvet_royale',
    'celestial_etoile','coquette_couture','little_wildflower','luz_de_cielo',
    'two_little_secrets','studio_party','xv_gala','baby_soft','baptism_light',
    'botanical','noir','pink_atelier','celestial','cloud','garden'
  ) THEN RETURN false; END IF;
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
    'headline','event_label','intro_headline','introduction',
    'religious_ceremony_time','religious_ceremony_venue','religious_ceremony_address',
    'reception_time','reception_venue','reception_address',
    'dress_code','gift_message','confirmation_mode'
  ] LOOP
    IF p_content_config ? v_key THEN
      v_content := v_content || jsonb_build_object(v_key,
        left(coalesce(p_content_config->>v_key,''), CASE v_key
          WHEN 'headline' THEN 120 WHEN 'event_label' THEN 60
          WHEN 'intro_headline' THEN 80 WHEN 'introduction' THEN 180
          WHEN 'religious_ceremony_time' THEN 10 WHEN 'religious_ceremony_venue' THEN 160
          WHEN 'religious_ceremony_address' THEN 240 WHEN 'reception_time' THEN 10
          WHEN 'reception_venue' THEN 160 WHEN 'reception_address' THEN 240
          WHEN 'dress_code' THEN 100 WHEN 'gift_message' THEN 180 ELSE 20 END));
    END IF;
  END LOOP;

  IF p_content_config ? 'religious_ceremony_enabled' THEN
    IF p_content_config->>'religious_ceremony_enabled' NOT IN ('true','false') THEN RETURN false; END IF;
    v_content := v_content || jsonb_build_object('religious_ceremony_enabled', (p_content_config->>'religious_ceremony_enabled')::boolean);
  END IF;

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
