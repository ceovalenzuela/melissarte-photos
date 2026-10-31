-- Align the invitation draft table constraint with the active and retained template keys.
ALTER TABLE public.invitation_drafts
  DROP CONSTRAINT IF EXISTS invitation_drafts_template_key_check;

ALTER TABLE public.invitation_drafts
  ADD CONSTRAINT invitation_drafts_template_key_check
  CHECK (template_key = ANY (ARRAY[
    'wedding_editorial',
    'maison_botanique',
    'noir_champagne',
    'velvet_royale',
    'celestial_etoile',
    'coquette_couture',
    'little_wildflower',
    'luz_de_cielo',
    'two_little_secrets',
    'studio_party',
    'xv_gala',
    'baby_soft',
    'baptism_light',
    'botanical',
    'noir',
    'pink_atelier',
    'celestial',
    'cloud',
    'garden'
  ]::text[]));
