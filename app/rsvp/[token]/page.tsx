import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { InvitationTemplateKey } from "@/types/invitation";
import { INVITATION_PALETTES } from "@/lib/invitation-palettes";

import { supabase } from "@/lib/supabase";
import { getEventBySlug } from "@/lib/events";
import InvitationGuestCenter from "@/components/invitations/InvitationGuestCenter";

interface Props {
  params: Promise<{ token: string }>;
}

const organizerAccents: Record<InvitationTemplateKey, { bannerStart: string; bannerEnd: string; bannerText: string; bannerAccent: string; muted: string; soft: string }> = {
  wedding_editorial: { bannerStart: "#344B61", bannerEnd: "#20272D", bannerText: "#F5F3EE", bannerAccent: "#8295A5", muted: "#4D5357", soft: "#EAE7DF" },
  xv_gala: { bannerStart: "#211B35", bannerEnd: "#49324F", bannerText: "#FFFAF0", bannerAccent: "#E2C47A", muted: "#C9BED1", soft: "#30263F" },
  baby_soft: { bannerStart: "#A85F47", bannerEnd: "#3F7184", bannerText: "#FFFEFA", bannerAccent: "#F0D276", muted: "#756054", soft: "#E9F4F6" },
  baptism_light: { bannerStart: "#263641", bannerEnd: "#426D86", bannerText: "#FFFFFF", bannerAccent: "#C7DBE5", muted: "#536873", soft: "#E3EEF3" },
};

export default async function OrganizerConfirmationsPage({ params }: Props) {
  const { token } = await params;
  const { data, error } = await supabase.rpc("get_event_by_organizer_token", {
    p_token: token,
  });
  const event = data?.[0];

  if (error || !event) notFound();

  const [{ data: invitationEnabled }, eventDetails, invitationResult] = await Promise.all([
    supabase.rpc("get_event_invitation_enabled", { p_token: token }),
    getEventBySlug(event.slug),
    supabase.rpc("get_invitation_for_organizer", { p_event_id: event.id, p_organizer_token: token }),
  ]);

  if (invitationEnabled !== true) notFound();
  const invitation = invitationResult.data?.[0];
  const templateKeys: InvitationTemplateKey[] = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"];
  const templateKey: InvitationTemplateKey = templateKeys.includes(invitation?.template_key as InvitationTemplateKey)
    ? (invitation.template_key as InvitationTemplateKey)
    : "wedding_editorial";
  const palette = INVITATION_PALETTES[templateKey];
  const organizerAccent = organizerAccents[templateKey];
  // Keep this management page aligned to the selected template while using curated,
  // contrast-safe colors rather than arbitrary custom text/background combinations.
  const organizerThemeStyle = {
    "--organizer-accent": palette.accent_color,
    "--organizer-bg": palette.background_color,
    "--organizer-text": palette.text_color,
    // Keep management surfaces light and readable across every template.
    // The selected palette remains on the hero, page background, and accents.
    "--organizer-card": "#FFFDFA",
    "--organizer-card-text": "#302B27",
    "--organizer-border": "#E7E1D8",
    "--organizer-button": palette.button_color,
    "--organizer-button-text": palette.button_text_color,
    "--organizer-banner-start": organizerAccent.bannerStart,
    "--organizer-banner-end": organizerAccent.bannerEnd,
    "--organizer-banner-text": organizerAccent.bannerText,
    "--organizer-banner-accent": organizerAccent.bannerAccent,
    "--organizer-muted": organizerAccent.muted,
    "--organizer-soft": "#F5F1EB",
  } as CSSProperties;

  return (
    <main className={`organizer-confirmations invitation-template-${templateKey} min-h-screen`} style={organizerThemeStyle}>
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-9">
        <header className="organizer-confirmations-header relative mt-4 overflow-hidden rounded-[1.75rem] border shadow-[0_18px_60px_rgba(31,48,64,0.12)]">
          <div className="organizer-confirmations-banner relative overflow-hidden px-6 py-7 sm:px-9 sm:py-9">
            <span className="organizer-confirmations-ornament" aria-hidden="true" />
            <div className="relative z-10">
              <p className="organizer-confirmations-eyebrow text-[10px] font-semibold uppercase tracking-[0.28em]">Panel del organizador</p>
              <h1 className="organizer-confirmations-title mt-3 font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Confirmaciones</h1>
              <p className="organizer-confirmations-subtitle mt-2 text-sm leading-6">
                {eventDetails?.title ?? "Tu evento"}
                {eventDetails?.event_date ? ` · ${new Date(`${eventDetails.event_date}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}` : ""}
              </p>
            </div>
          </div>
        </header>
        <div className="mt-5 sm:mt-6">
          <InvitationGuestCenter eventId={event.id} organizerToken={token} invitationSlug={invitation?.slug} />
        </div>
      </div>
    </main>
  );
}
