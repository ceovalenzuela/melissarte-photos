import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/events";

import PublicEventClient from "@/components/public/PublicEventClient";
import Footer from "@/components/public/Footer";
import EventHero from "@/components/public/EventHero";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicEventPage({
  params,
}: Props) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <EventHero event={event} />

        <PublicEventClient event={event} />

        <Footer />
      </div>
    </main>
  );
}