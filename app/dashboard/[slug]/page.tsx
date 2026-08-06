import { notFound } from "next/navigation";

import EventHero from "@/components/events/EventHero";
import EventActions from "@/components/events/EventActions";
import { getEventBySlug } from "@/lib/events";
import { getPhotoCount } from "@/lib/photos";
import GallerySection from "@/components/gallery/GallerySection";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ClientDashboardPage({
  params,
}: Props) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
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

    <div className="mx-auto mt-6 max-w-3xl">
      <EventActions event={event} />
    </div>

    <div className="mx-auto mt-5 max-w-6xl">
      <GallerySection event={event} />
    </div>
  </div>
</main>
  );
}