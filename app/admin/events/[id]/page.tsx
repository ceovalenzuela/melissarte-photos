import { notFound } from "next/navigation";

import { getEvent } from "@/lib/events";

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
      <h1 className="text-3xl font-bold">
        {event.display_name || event.title}
      </h1>

      <div className="mt-8 space-y-3 rounded-xl border bg-white p-6">
        <p>
          <strong>Fecha:</strong>{" "}
          {event.event_date || "Sin fecha"}
        </p>

        <p>
          <strong>Tipo:</strong>{" "}
          {event.event_type || "Sin definir"}
        </p>

        <p>
          <strong>Slug:</strong>{" "}
          /e/{event.slug}
        </p>

        <p>
          <strong>Estado:</strong>{" "}
          {event.is_active ? "Activo" : "Inactivo"}
        </p>
      </div>
    </main>
  );
}