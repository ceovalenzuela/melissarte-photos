import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CSSProperties } from "react";
import type { InvitationTemplateKey } from "@/types/invitation";

import { supabase } from "@/lib/supabase";
import { getEventBySlug } from "@/lib/events";
import InvitationGuestCenter from "@/components/invitations/InvitationGuestCenter";

interface Props {
  params: Promise<{ token: string }>;
}

const organizerPalettes = {
  wedding_editorial: {
    bg: "#F6F0E4", text: "#302F30", card: "#FFFCF6", cardText: "#302F30",
    border: "#C9AD6B", button: "#755B2E", buttonText: "#FFFFFF",
    bannerStart: "#273747", bannerEnd: "#3B5263", bannerText: "#FFFAF0", bannerAccent: "#E4CA8A", muted: "#625F59", soft: "#F5EFE4",
  },
  xv_gala: {
    bg: "#F1EDF6", text: "#2B2238", card: "#FFFCFF", cardText: "#2B2238",
    border: "#C7AC68", button: "#49324F", buttonText: "#FFFFFF",
    bannerStart: "#211B35", bannerEnd: "#49324F", bannerText: "#FFFAF2", bannerAccent: "#E0C276", muted: "#62596B", soft: "#F3EEF6",
  },
  baby_soft: {
    bg: "#FFF4E8", text: "#493C32", card: "#FFFEFA", cardText: "#493C32",
    border: "#E5C5B2", button: "#854A37", buttonText: "#FFFFFF",
    bannerStart: "#754638", bannerEnd: "#4F6650", bannerText: "#FFFCF7", bannerAccent: "#F7DDA0", muted: "#68564B", soft: "#FFF0E5",
  },
  baptism_light: {
    bg: "#EFF6F8", text: "#263641", card: "#FFFFFF", cardText: "#263641",
    border: "#C7DBE5", button: "#315F75", buttonText: "#FFFFFF",
    bannerStart: "#31596B", bannerEnd: "#527F98", bannerText: "#FFFFFF", bannerAccent: "#E7F2F5", muted: "#536873", soft: "#EAF3F6",
  },
} satisfies Record<InvitationTemplateKey, {
  bg: string; text: string; card: string; cardText: string; border: string; button: string; buttonText: string;
  bannerStart: string; bannerEnd: string; bannerText: string; bannerAccent: string; muted: string; soft: string;
}>;

function validColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

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
  const palette = organizerPalettes[templateKey];
  const design = invitation?.design_config ?? {};

  // Keep surfaces and text on accessible, template-specific defaults. Custom accent/border
  // colors are honored where supplied; arbitrary custom background/text colors do not
  // override these contrast-safe pairings.
  const organizerThemeStyle = {
    "--organizer-accent": validColor(design.accent_color) ? design.accent_color : palette.border,
    "--organizer-bg": palette.bg,
    "--organizer-text": palette.text,
    "--organizer-card": palette.card,
    "--organizer-card-text": palette.cardText,
    "--organizer-border": validColor(design.border_color) ? design.border_color : palette.border,
    "--organizer-button": palette.button,
    "--organizer-button-text": palette.buttonText,
    "--organizer-banner-start": palette.bannerStart,
    "--organizer-banner-end": palette.bannerEnd,
    "--organizer-banner-text": palette.bannerText,
    "--organizer-banner-accent": palette.bannerAccent,
    "--organizer-muted": palette.muted,
    "--organizer-soft": palette.soft,
  } as CSSProperties;

  return (
    <main className={`organizer-confirmations invitation-template-${templateKey} min-h-screen`} style={organizerThemeStyle}>
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-9">
        <Link
          href={"/mi-galeria/" + token}
          className="organizer-confirmations-back inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver al evento
        </Link>
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
