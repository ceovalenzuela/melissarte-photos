import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
  maison_botanique: { bannerStart: "#40543D", bannerEnd: "#71836A", bannerText: "#FFFDF7", bannerAccent: "#D8CDAF", muted: "#53604F", soft: "#E7EADD" },
  noir_champagne: { bannerStart: "#1E1B19", bannerEnd: "#44372D", bannerText: "#F8F0E4", bannerAccent: "#C9AC78", muted: "#6A5C4B", soft: "#EAE2D5" },
  velvet_royale: { bannerStart: "#3B1724", bannerEnd: "#6A2B41", bannerText: "#FFF2E9", bannerAccent: "#D7AF83", muted: "#76505A", soft: "#F1E2DD" },
  celestial_etoile: { bannerStart: "#161D3B", bannerEnd: "#3A426C", bannerText: "#F7F3FF", bannerAccent: "#B8B7DC", muted: "#626B9A", soft: "#E5E6F2" },
  coquette_couture: { bannerStart: "#8D3553", bannerEnd: "#C76F88", bannerText: "#FFFBFC", bannerAccent: "#F6C9D6", muted: "#8A5266", soft: "#F8E4EA" },
  little_wildflower: { bannerStart: "#68764E", bannerEnd: "#A8AF7C", bannerText: "#FFF9EC", bannerAccent: "#D6C99F", muted: "#727B59", soft: "#F0E8CC" },
  luz_de_cielo: { bannerStart: "#476B7A", bannerEnd: "#99BCC9", bannerText: "#FFFFFF", bannerAccent: "#D6E7ED", muted: "#627D87", soft: "#EAF2F5" },
  two_little_secrets: { bannerStart: "#69536C", bannerEnd: "#B98B91", bannerText: "#FFF9F5", bannerAccent: "#E7C6C5", muted: "#806B78", soft: "#F2E9ED" },
  studio_party: { bannerStart: "#243D93", bannerEnd: "#E35A36", bannerText: "#FFFFFF", bannerAccent: "#F3C66C", muted: "#525C88", soft: "#F7E5D1" },
  xv_gala: { bannerStart: "#211B35", bannerEnd: "#49324F", bannerText: "#FFFAF0", bannerAccent: "#E2C47A", muted: "#C9BED1", soft: "#30263F" },
  baby_soft: { bannerStart: "#A85F47", bannerEnd: "#3F7184", bannerText: "#FFFEFA", bannerAccent: "#F0D276", muted: "#756054", soft: "#E9F4F6" },
  baptism_light: { bannerStart: "#263641", bannerEnd: "#426D86", bannerText: "#FFFFFF", bannerAccent: "#C7DBE5", muted: "#536873", soft: "#E3EEF3" },
  botanical: { bannerStart: "#354B3A", bannerEnd: "#71836A", bannerText: "#FFFDF7", bannerAccent: "#D5C6A5", muted: "#53604F", soft: "#E4E8DC" },
  noir: { bannerStart: "#211F1D", bannerEnd: "#494039", bannerText: "#F3EDE2", bannerAccent: "#C6A66B", muted: "#6D6255", soft: "#E9E1D5" },
  pink_atelier: { bannerStart: "#8F2454", bannerEnd: "#C52F70", bannerText: "#FFFAFC", bannerAccent: "#F2C6D7", muted: "#7A3B58", soft: "#F8D2E0" },
  celestial: { bannerStart: "#303B68", bannerEnd: "#7886BD", bannerText: "#FAFAFF", bannerAccent: "#D5DAF0", muted: "#59658E", soft: "#D5DAF0" },
  cloud: { bannerStart: "#80634D", bannerEnd: "#B58C66", bannerText: "#FFFEFA", bannerAccent: "#F8EEDC", muted: "#776453", soft: "#F8EEDC" },
  garden: { bannerStart: "#596F56", bannerEnd: "#B96F55", bannerText: "#FFFCF7", bannerAccent: "#E8D4C1", muted: "#6B5B4F", soft: "#E8E6D8" },
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
  const templateKeys: InvitationTemplateKey[] = [
    "wedding_editorial", "maison_botanique", "noir_champagne", "velvet_royale",
    "celestial_etoile", "coquette_couture", "little_wildflower", "luz_de_cielo",
    "two_little_secrets", "studio_party",
    "xv_gala", "baby_soft", "baptism_light", "botanical", "noir", "pink_atelier", "celestial", "cloud", "garden",
  ];
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
    "--organizer-muted": "#62574C",
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
              {invitation?.slug && (
                <Link
                  href={`/i/${encodeURIComponent(invitation.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: "var(--organizer-banner-accent)", backgroundColor: "var(--organizer-card)", color: "var(--organizer-card-text)" }}
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  Ver mi invitación
                </Link>
              )}
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
