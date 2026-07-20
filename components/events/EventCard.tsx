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
        {event.display_name || event.title}
      </h3>

      <p className="mt-2 text-gray-500">
        📅 {event.event_date || "Sin fecha"}
      </p>

      <p className="text-gray-500">
        🔗 /e/{event.slug}
      </p>

      <div className="mt-5 flex gap-3">
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-white">
          Administrar
        </button>

        <button
          onClick={onEdit}
          className="rounded-lg border px-3 py-2"
        >
          Editar
        </button>

<button
  onClick={onDelete}
  className="rounded-lg border border-red-500 px-3 py-2 text-red-500"
>
  Eliminar
</button>
      </div>
    </div>
  );
}