import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getEventBySlug } from "@/lib/events";
import InvitationResponses from "@/components/invitations/InvitationResponses";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function OrganizerRSVPPage({ params }: Props) {
  const { token } = await params;
  const { data, error } = await supabase.rpc("get_event_by_organizer_token", {
    p_token: token,
  });
  const event = data?.[0];

  if (error || !event) notFound();

  const [{ data: invitationEnabled }, eventDetails] = await Promise.all([
    supabase.rpc("get_event_invitation_enabled", { p_token: token }),
    getEventBySlug(event.slug),
  ]);

  if (invitationEnabled !== true) notFound();

  return (
    <main className="min-h-screen bg-[#FBF9F5]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href={"/mi-galeria/" + token} className="inline-flex items-center gap-2 text-sm font-medium text-[#7D7467] hover:text-[#1F1F1F]">
          <ArrowLeft size={16} /> Volver al panel del organizador
        </Link>
        <header className="mt-5 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A88249]">Melissarte · Invitación digital</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#332B27]">Confirmaciones de asistencia</h1>
          <p className="mt-2 text-sm text-[#7D7467]">{eventDetails?.title ?? "Tu evento"}</p>
        </header>
        <div className="mt-6">
          <InvitationResponses eventId={event.id} organizerToken={token} />
        </div>
      </div>
    </main>
  );
}
