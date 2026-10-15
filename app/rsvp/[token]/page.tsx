import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CSSProperties } from "react";

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
  const organizerThemeStyle = {
    "--organizer-accent": "#A78645",
    "--organizer-bg": "#F6F2EA",
    "--organizer-text": "#202B37",
    "--organizer-card": "#FFFDFA",
    "--organizer-card-text": "#202B37",
    "--organizer-border": "#D9C9A8",
    "--organizer-button": "#273747",
    "--organizer-button-text": "#FFFFFF",
    "--organizer-banner-start": "#1F3040",
    "--organizer-banner-end": "#354D60",
    "--organizer-banner-text": "#FFFCF5",
    "--organizer-banner-accent": "#E4CA8A",
    "--organizer-muted": "#625F59",
    "--organizer-soft": "#F4EFE5",
  } as CSSProperties;

  return (
    <main className="organizer-confirmations min-h-screen" style={organizerThemeStyle}>
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
