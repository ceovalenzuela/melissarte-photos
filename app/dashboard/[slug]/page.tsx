import { notFound } from "next/navigation";

import EventHero from "@/components/events/EventHero";
import EventActions from "@/components/events/EventActions";
import { getEventBySlug } from "@/lib/events";

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <EventHero
          event={event}
          showWelcomeMessage={false}
        />

        <div className="mx-auto max-w-3xl">
          <EventActions event={event} />
        </div>
      </div>
    </main>
  );
}