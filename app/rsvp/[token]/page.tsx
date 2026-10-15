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
  const content = invitation?.content_config ?? {};
  const design = invitation?.design_config ?? {};
  const templateKeys: InvitationTemplateKey[] = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"];
  const templateKey: InvitationTemplateKey = templateKeys.includes(invitation?.template_key as InvitationTemplateKey)
    ? (invitation.template_key as InvitationTemplateKey)
    : "wedding_editorial";
  const organizerDefaults = ({
    wedding_editorial: { accent: "#A78645", bg: "#F4EAD8", text: "#302F30", card: "#FFFCF6", cardText: "#302F30", border: "#C9AD6B", button: "#A78645", buttonText: "#FFFFFF" },
    xv_gala: { accent: "#D6B66F", bg: "#211B35", text: "#FFFAF0", card: "#39304C", cardText: "#FFFAF0", border: "#D6B66F", button: "#6F4B68", buttonText: "#FFFFFF" },
    baby_soft: { accent: "#A85F47", bg: "#FFF4E8", text: "#493C32", card: "#FFFEFA", cardText: "#493C32", border: "#E5C5B2", button: "#A96149", buttonText: "#FFFFFF" },
    baptism_light: { accent: "#527F98", bg: "#FAF7F0", text: "#263641", card: "#FFFFFF", cardText: "#263641", border: "#C7DBE5", button: "#527F98", buttonText: "#FFFFFF" },
  } satisfies Record<InvitationTemplateKey, { accent: string; bg: string; text: string; card: string; cardText: string; border: string; button: string; buttonText: string }>)[templateKey];
  const validColor = (value: string | undefined, fallback: string) => value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  const organizerThemeStyle = {
    "--organizer-accent": validColor(design.accent_color, organizerDefaults.accent),
    "--organizer-bg": validColor(design.background_color, organizerDefaults.bg),
    "--organizer-text": validColor(design.text_color, organizerDefaults.text),
    "--organizer-card": validColor(design.card_background_color, organizerDefaults.card),
    "--organizer-card-text": validColor(design.card_text_color, organizerDefaults.cardText),
    "--organizer-border": validColor(design.border_color, organizerDefaults.border),
    "--organizer-button": validColor(design.button_color, organizerDefaults.button),
    "--organizer-button-text": validColor(design.button_text_color, organizerDefaults.buttonText),
  } as CSSProperties;

  return (
    <main className={`organizer-confirmations invitation-template-${templateKey} min-h-screen`} style={organizerThemeStyle}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href={"/mi-galeria/" + token} className="inline-flex items-center gap-2 text-sm font-medium text-[#7D7467] hover:text-[#1F1F1F]">
          <ArrowLeft size={16} /> Volver al evento
        </Link>
        <header className="organizer-confirmations-header relative mt-5 overflow-hidden rounded-[1.75rem] border shadow-[0_18px_60px_rgba(48,36,27,0.08)]">
          <div className="organizer-confirmations-banner px-6 py-8 sm:px-9 sm:py-10">
            <p className="organizer-confirmations-eyebrow text-[10px] font-semibold uppercase tracking-[0.28em]">Panel del organizador</p>
            <h1 className="organizer-confirmations-title mt-3 font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Confirmaciones</h1>
            <p className="organizer-confirmations-subtitle mt-2 text-sm">{eventDetails?.title ?? "Tu evento"}{eventDetails?.event_date ? ` · ${new Date(`${eventDetails.event_date}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}` : ""}</p>
          </div>
        </header>
        <div className="mt-6"><InvitationGuestCenter eventId={event.id} organizerToken={token} invitationSlug={invitation?.slug} /></div>
      </div>
    </main>
  );
}
