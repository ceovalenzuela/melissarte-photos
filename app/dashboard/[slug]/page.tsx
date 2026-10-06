import { notFound } from "next/navigation";

import EventActions from "@/components/events/EventActions";
import OwnerEventHeader from "@/components/owner/OwnerEventHeader";
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
  await supabase.rpc(
    "get_event_by_organizer_token",
    {
      p_token: token,
    }
  );

if (
  tokenError ||
  !authorizedEvents?.length ||
  authorizedEvents[0].id !== event.id
) {
  notFound();
}

  const photoCount = await getPhotoCount(event.id);

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);

  return (
    <main className="min-h-screen bg-[#FBF9F5]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <OwnerEventHeader event={event} />

        <EventActions event={event} />

        <section className="mt-10 border-t border-[#E7DCC8] pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#A88249]">
                Contenido
              </p>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[#1F1F1F]">
                Lo que está pasando en tu galería
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#7D7467]">
              <span><strong className="font-semibold text-[#3F3A34]">{photoCount}</strong> fotos</span>
              <span><strong className="font-semibold text-[#3F3A34]">{messageCount ?? 0}</strong> recuerdos</span>
            </div>
          </div>

          <div className="mt-6">
            <GallerySection event={event} />
          </div>
        </section>

        <section className="mt-12 border-t border-[#E7DCC8] pt-10">
          <GuestMessages
            eventId={event.id}
            event={event}
            canDelete
            showComposer={false}
            showDownloads
          />
        </section>

        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </main>
  );
}