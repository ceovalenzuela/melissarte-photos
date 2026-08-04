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
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F]">
          {event.title}
        </h1>

        <p className="mt-2 text-[#7D7467]">
          Edita la información del evento y su contenido.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <EventEditor event={event} />
      </div>
    </main>
  );
}