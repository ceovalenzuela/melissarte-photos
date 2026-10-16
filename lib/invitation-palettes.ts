import type { InvitationDesign, InvitationTemplateKey } from "@/types/invitation";

export const INVITATION_PALETTES: Record<InvitationTemplateKey, InvitationDesign> = {
  wedding_editorial: { background_color: "#F4EAD8", accent_color: "#A78645", text_color: "#273747", title_color: "#273747", card_background_color: "#FFFCF6", card_text_color: "#302F30", border_color: "#C9AD6B", button_color: "#A78645", button_text_color: "#FFFFFF", rsvp_background_color: "#273747", rsvp_text_color: "#FFFAF0", form_background_color: "#FFFDF8", form_text_color: "#302F30" },
  xv_gala: { background_color: "#211B35", accent_color: "#E2C47A", text_color: "#FFFAF0", title_color: "#FFFAF0", card_background_color: "#39304C", card_text_color: "#FFFAF0", border_color: "#D6B66F", button_color: "#805773", button_text_color: "#FFFFFF", rsvp_background_color: "#211B35", rsvp_text_color: "#FFFAF0", form_background_color: "#FFFDF9", form_text_color: "#30283A" },
  baby_soft: { background_color: "#FFF4E8", accent_color: "#A85F47", text_color: "#493C32", title_color: "#875744", card_background_color: "#FFFEFA", card_text_color: "#493C32", border_color: "#B9DCE7", button_color: "#528DA3", button_text_color: "#FFFFFF", rsvp_background_color: "#E9F4F6", rsvp_text_color: "#493C32", form_background_color: "#FFFEFA", form_text_color: "#493C32" },
  baptism_light: { background_color: "#FAF7F0", accent_color: "#527F98", text_color: "#263641", title_color: "#263641", card_background_color: "#FFFFFF", card_text_color: "#263641", border_color: "#C7DBE5", button_color: "#527F98", button_text_color: "#FFFFFF", rsvp_background_color: "#E3EEF3", rsvp_text_color: "#263641", form_background_color: "#FFFFFF", form_text_color: "#263641" },
};

export const INVITATION_TEMPLATE_OPTIONS: { key: InvitationTemplateKey; label: string; description: string }[] = [
  { key: "wedding_editorial", label: "Boda · Editorial", description: "Marfil luminoso, azul tinta y champagne" },
  { key: "xv_gala", label: "XV años · Gala", description: "Ciruela profunda, malva y oro" },
  { key: "baby_soft", label: "Baby shower · Suave", description: "Durazno, salvia, amarillo mantequilla y celeste" },
  { key: "baptism_light", label: "Bautizo · Luz", description: "Marfil, azul cielo y dorado" },
];
