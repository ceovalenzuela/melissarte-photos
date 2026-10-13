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

  const photoCount = await getPhotoCount(event.id);

  return (
    <main className="min-h-screen bg-[#FBF9F5]">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <EventHero event={event} photoCount={photoCount} showWelcomeMessage={false} />

        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <EventActions event={event} />
          <Link
            href={"/mi-galeria/" + token + "/confirmaciones"}
            className="inline-flex items-center rounded-full bg-[#A88249] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8E6D3D]"
          >
            Ver confirmaciones RSVP
          </Link>
        </div>

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
