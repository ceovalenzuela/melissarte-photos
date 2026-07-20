"use client";

import Link from "next/link";

import { Event } from "@/types/event";

type Props = {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EventCard({
  event,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-xl font-semibold">
{event.title}
      </h3>

      <p className="mt-2 text-gray-500">
        📅 {event.event_date || "Sin fecha"}
      </p>

      <p className="text-gray-500">
        🔗 /e/{event.slug}
      </p>

      <div className="mt-5 flex gap-3">
        <Link
          href={`/admin/events/${event.id}`}
          className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          Administrar
        </Link>

        <button
          onClick={onEdit}
          className="rounded-lg border px-3 py-2 hover:bg-gray-50"
        >
          Editar
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}