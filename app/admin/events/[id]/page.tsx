import { notFound } from "next/navigation";
import { getEvent } from "@/lib/events";
import EventEditor from "@/components/events/EventEditor";

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

<EventEditor event={event} />

</main>
  );
}