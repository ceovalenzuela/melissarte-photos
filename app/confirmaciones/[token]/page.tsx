import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getEventBySlug } from "@/lib/events";
import InvitationResponses from "@/components/invitations/InvitationResponses";

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
  const mapsQuery = [content.ceremony_venue, content.ceremony_address].filter(Boolean).join(", ");
  const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}` : null;

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href={"/mi-galeria/" + token} className="inline-flex items-center gap-2 text-sm font-medium text-[#7D7467] hover:text-[#1F1F1F]">
          <ArrowLeft size={16} /> Volver al evento
        </Link>
        <header className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-[#E7DCC8] bg-white shadow-[0_18px_60px_rgba(48,36,27,0.08)]">
          <div className="bg-gradient-to-br from-[#382C26] via-[#6F5545] to-[#B79A7A] px-6 py-8 text-white sm:px-9 sm:py-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">Panel del organizador</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Confirmaciones</h1>
            <p className="mt-2 text-sm text-white/85">{eventDetails?.title ?? "Tu evento"}{eventDetails?.event_date ? ` · ${new Date(`${eventDetails.event_date}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}` : ""}</p>
          </div>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="min-w-0"><p className="text-sm font-medium text-[#332B27]">{content.ceremony_venue || "Lugar del evento"}</p>{content.ceremony_address && <p className="mt-1 text-sm text-[#7D7467]">{content.ceremony_address}</p>}</div>
            {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm font-medium text-[#5C554B] hover:bg-[#F7F3EC]"><ArrowLeft className="rotate-180" size={14} />Abrir Google Maps</a>}
          </div>
        </header>
        <div className="mt-6"><InvitationResponses eventId={event.id} organizerToken={token} /></div>
      </div>
    </main>
  );
}
