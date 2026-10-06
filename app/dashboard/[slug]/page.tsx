import { notFound } from "next/navigation";

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

  const photoCount = await getPhotoCount(event.id);

  return (
    <main className="min-h-screen bg-[#FBF9F5]">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <EventHero event={event} photoCount={photoCount} showWelcomeMessage={false} />

        <div className="relative z-20 mx-auto -mt-5 w-[92%] max-w-5xl sm:-mt-6">
          <EventActions event={event} />
        </div>

        <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
          <GallerySection event={event} />
        </div>

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
