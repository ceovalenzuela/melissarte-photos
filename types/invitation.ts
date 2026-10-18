export type InvitationTemplateKey = "wedding_editorial" | "xv_gala" | "baby_soft" | "baptism_light";

export type InvitationStatus = "draft" | "published";
export type RSVPStatus = "attending" | "declined";

export interface InvitationContent {
  event_label?: string;
  headline?: string;
  subtitle?: string;
  host_names?: string;
  introduction?: string;
  ceremony_time?: string;
  ceremony_venue?: string;
  ceremony_address?: string;
  religious_ceremony_enabled?: boolean;
  religious_ceremony_time?: string;
  religious_ceremony_venue?: string;
  religious_ceremony_address?: string;
  reception_time?: string;
  reception_venue?: string;
  reception_address?: string;
  dress_code?: string;
  gift_message?: string;
  gift_type?: string;
  gift_registry_url?: string;
  gift_registry_label?: string;
  confirmation_mode?: "rsvp" | "whatsapp" | "none";
  whatsapp_confirmation_phone?: string;
  rsvp_deadline?: string;
  closing_note?: string;
}

export interface InvitationDesign {
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  title_color?: string;
  card_background_color?: string;
  card_text_color?: string;
  border_color?: string;
  button_color?: string;
  button_text_color?: string;
  rsvp_background_color?: string;
  rsvp_text_color?: string;
  form_background_color?: string;
  form_text_color?: string;
  cover_image_url?: string;
}

export interface PublicInvitation {
  invitation_id: string;
  event_id: string;
  event_title: string;
  event_date: string | null;
  event_type: string | null;
  event_slug: string;
  invitation_slug: string;
  template_key: string;
  design_config: InvitationDesign;
  content_config: InvitationContent;
  rsvp_enabled: boolean;
  max_party_size: number;
  invitation_status: InvitationStatus;
  cover_image: string | null;
  cover_position_y: number | null;
}

export interface RSVPResponse {
  response_id: string;
  guest_name: string;
  attendance_status: RSVPStatus;
  party_size: number;
  phone: string | null;
}

export interface RSVPSubmissionResult {
  response_id: string;
  edit_token: string;
}
