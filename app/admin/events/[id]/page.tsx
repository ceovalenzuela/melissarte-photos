import { notFound } from "next/navigation";

import { getEvent } from "@/lib/events";
import EventInfoCard from "@/components/events/EventInfoCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventPage({
  params,
}: Props) {
  const { id } = await params;

  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
<main className="mx-auto max-w-5xl p-8">

  <h1 className="mb-8 text-3xl font-bold">
    {event.title}
  </h1>

  <EventInfoCard
    title={event.title}
    slug={event.slug}
    eventDate={event.event_date}
    type={event.type}
    status={event.status}
  />

</main>
  );
}