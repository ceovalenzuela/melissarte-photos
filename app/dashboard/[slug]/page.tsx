import { notFound } from "next/navigation";
import Link from "next/link";

import EventHero from "@/components/events/EventHero";
import EventActions from "@/components/events/EventActions";
import GuestMessages from "@/components/public/GuestMessages";
import { getEventBySlug } from "@/lib/events";
import { getPhotoCount } from "@/lib/photos";
import GallerySection from "@/components/gallery/GallerySection";
import Footer from "@/components/public/Footer";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ClientDashboardPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  if (!token) {
    notFound();
  }

  const { data: authorizedEvents, error: tokenError } =
    await supabase.rpc("get_event_by_organizer_token", {
      p_token: token,
    });

  if (
    tokenError ||
    !authorizedEvents?.length ||
    authorizedEvents[0].id !== event.id
  ) {
    notFound();
  }

  const [{ data: invitationEnabled }, photoCount] = await Promise.all([
    supabase.rpc("get_event_invitation_enabled", { p_token: token }),
    getPhotoCount(event.id),
  ]);

  return (
    <main className="min-h-screen bg-[#FBF9F5]">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <EventHero event={event} photoCount={photoCount} showWelcomeMessage={false} />

        <div className="mx-auto mt-6 max-w-6xl">
          <EventActions event={event} />
        </div>

        {invitationEnabled === true && (
          <section className="mx-auto mt-6 max-w-6xl rounded-2xl border border-[#E7DCC8] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A88249]">Producto independiente</p>
              <h2 className="mt-1 text-xl font-semibold text-[#332B27]">Invitación digital</h2>
              <p className="mt-1 text-sm leading-6 text-[#7D7467]">Consulta las respuestas de tus invitados sin entrar a las herramientas de la galería.</p>
            </div>
            <Link
              href={"/mi-galeria/" + token + "/confirmaciones"}
              className="mt-4 inline-flex shrink-0 items-center justify-center rounded-full bg-[#A88249] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8E6D3D] sm:mt-0"
            >
              Ver confirmaciones
            </Link>
          </section>
        )}

        <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
          <GallerySection event={event} />
        </div>

        {event.messages_enabled && (
          <GuestMessages
            eventId={event.id}
            event={event}
            canDelete
            showComposer={false}
            showDownloads
            organizerToken={token}
          />
        )}

        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </main>
  );
}
