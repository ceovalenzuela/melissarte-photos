import type { InvitationDesign, InvitationTemplateKey } from "@/types/invitation";

export const INVITATION_PALETTES: Record<InvitationTemplateKey, InvitationDesign> = {
  wedding_editorial: { background_color: "#F5F0E7", accent_color: "#D5B77C", text_color: "#282A2E", title_color: "#111B29", card_background_color: "#34465D", card_text_color: "#F5F0E7", border_color: "#D5B77C", button_color: "#D5B77C", button_text_color: "#111B29", rsvp_background_color: "#111B29", rsvp_text_color: "#F5F0E7", form_background_color: "#FFFDF9", form_text_color: "#282A2E" },
  xv_gala: { background_color: "#211B35", accent_color: "#E2C47A", text_color: "#FFFAF0", title_color: "#FFFAF0", card_background_color: "#39304C", card_text_color: "#FFFAF0", border_color: "#D6B66F", button_color: "#805773", button_text_color: "#FFFFFF", rsvp_background_color: "#211B35", rsvp_text_color: "#FFFAF0", form_background_color: "#FFFDF9", form_text_color: "#30283A" },
  baby_soft: { background_color: "#FFF4E8", accent_color: "#A85F47", text_color: "#493C32", title_color: "#875744", card_background_color: "#FFFEFA", card_text_color: "#493C32", border_color: "#B9DCE7", button_color: "#3F7184", button_text_color: "#FFFFFF", rsvp_background_color: "#E9F4F6", rsvp_text_color: "#493C32", form_background_color: "#FFFEFA", form_text_color: "#493C32" },
  baptism_light: { background_color: "#FAF7F0", accent_color: "#426D86", text_color: "#263641", title_color: "#263641", card_background_color: "#FFFFFF", card_text_color: "#263641", border_color: "#C7DBE5", button_color: "#426D86", button_text_color: "#FFFFFF", rsvp_background_color: "#E3EEF3", rsvp_text_color: "#263641", form_background_color: "#FFFFFF", form_text_color: "#263641" },
  botanical: { background_color: "#F4F3EA", accent_color: "#71836A", text_color: "#343C32", title_color: "#354B3A", card_background_color: "#E4E8DC", card_text_color: "#343C32", border_color: "#B7C1A9", button_color: "#596F56", button_text_color: "#FFFFFF", rsvp_background_color: "#E4E8DC", rsvp_text_color: "#343C32", form_background_color: "#FFFDF7", form_text_color: "#343C32" },
  noir: { background_color: "#211F1D", accent_color: "#C6A66B", text_color: "#F3EDE2", title_color: "#F3EDE2", card_background_color: "#34302B", card_text_color: "#F3EDE2", border_color: "#8D744E", button_color: "#C6A66B", button_text_color: "#211F1D", rsvp_background_color: "#34302B", rsvp_text_color: "#F3EDE2", form_background_color: "#F8F4EC", form_text_color: "#302A24" },
  pink_atelier: { background_color: "#FCE9EF", accent_color: "#C52F70", text_color: "#54283C", title_color: "#8F2454", card_background_color: "#F8D2E0", card_text_color: "#54283C", border_color: "#E7A9C2", button_color: "#B82C69", button_text_color: "#FFFFFF", rsvp_background_color: "#F8D2E0", rsvp_text_color: "#54283C", form_background_color: "#FFFAFC", form_text_color: "#54283C" },
  celestial: { background_color: "#E9ECF8", accent_color: "#7886BD", text_color: "#303752", title_color: "#303B68", card_background_color: "#D5DAF0", card_text_color: "#303752", border_color: "#AEB8DF", button_color: "#59699F", button_text_color: "#FFFFFF", rsvp_background_color: "#D5DAF0", rsvp_text_color: "#303752", form_background_color: "#FAFAFF", form_text_color: "#303752" },
  cloud: { background_color: "#FFF8E9", accent_color: "#B58C66", text_color: "#55483D", title_color: "#80634D", card_background_color: "#F8EEDC", card_text_color: "#55483D", border_color: "#E8D9C2", button_color: "#9B795F", button_text_color: "#FFFFFF", rsvp_background_color: "#F8EEDC", rsvp_text_color: "#55483D", form_background_color: "#FFFEFA", form_text_color: "#55483D" },
  garden: { background_color: "#F7F0E7", accent_color: "#B96F55", text_color: "#493C35", title_color: "#6C5142", card_background_color: "#E8E6D8", card_text_color: "#493C35", border_color: "#D9B7A1", button_color: "#71816A", button_text_color: "#FFFFFF", rsvp_background_color: "#E8E6D8", rsvp_text_color: "#493C35", form_background_color: "#FFFCF7", form_text_color: "#493C35" },
};

export const INVITATION_TEMPLATE_OPTIONS: { key: InvitationTemplateKey; label: string; description: string }[] = [
  { key: "wedding_editorial", label: "Boda · Editorial", description: "Azul noche, marfil, champagne y carbón" },
  { key: "xv_gala", label: "XV años · Gala", description: "Ciruela profunda, malva y oro suave" },
  { key: "baby_soft", label: "Baby shower · Suave", description: "Durazno, terracota y celeste suave" },
  { key: "baptism_light", label: "Luz", description: "Marfil, azul grisáceo, celeste y plata" },
  { key: "botanical", label: "Botánico", description: "Verde salvia, marfil, rosa empolvado y oliva" },
  { key: "noir", label: "Noir", description: "Negro espresso, dorado antiguo, crema y café" },
  { key: "pink_atelier", label: "Pink Atelier", description: "Rosa intenso, blush, frambuesa y champagne" },
  { key: "celestial", label: "Celestial", description: "Azul profundo, lavanda azulada, plata y perla" },
  { key: "cloud", label: "Nube", description: "Amarillo mantequilla, lavanda, menta y durazno" },
  { key: "garden", label: "Jardín", description: "Verde salvia, terracota, durazno y marfil" },
];
