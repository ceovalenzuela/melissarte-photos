type Props = {
  title: string;
  date: string | null;
  slug: string;
};

export default function EventCard({
  title,
  date,
  slug,
}: Props) {
  return (
    <div
      className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
    >
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-500 mt-2">
        📅 {date ?? "Sin fecha"}
      </p>

      <p className="text-gray-500">
        🔗 /e/{slug}
      </p>

      <div className="flex gap-3 mt-5">
        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg">
          Administrar
        </button>

        <button className="border px-3 py-2 rounded-lg">
          Editar
        </button>

        <button className="border border-red-500 text-red-500 px-3 py-2 rounded-lg">
          Eliminar
        </button>
      </div>
    </div>
  );
}