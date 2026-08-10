import { notFound } from "next/navigation";

import EventHero from "@/components/events/EventHero";
import EventActions from "@/components/events/EventActions";
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

  return (
   <main className="min-h-screen bg-gray-50">
  <div className="mx-auto max-w-6xl px-4 py-6">
    <EventHero
      event={event}
      photoCount={photoCount}
      showWelcomeMessage={false}
    />

    {/* Tarjeta */}
    <div className="-mt-6 relative z-20 mx-auto w-[92%] max-w-3xl">
      <EventActions event={event} />
    </div>

    {/* Galería */}
    <div className="mx-auto mt-8 max-w-6xl">
      <GallerySection event={event} />
    </div>
    <div className="mt-8">
  <Footer />
</div>
  </div>
</main>
  );
}