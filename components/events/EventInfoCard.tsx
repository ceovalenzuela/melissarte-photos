type Props = {
  title: string;
  slug: string;
  eventDate: string;
  type: string | null;
  status: "draft" | "published";
};

export default function EventInfoCard({
  title,
  slug,
  eventDate,
  type,
  status,
}: Props) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        Información del evento
      </h2>

      <div className="space-y-4">

        <div>
          <label className="text-sm text-gray-500">
            Título
          </label>

          <p className="font-medium">{title}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Slug
          </label>

          <p>/e/{slug}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Fecha
          </label>

          <p>{eventDate}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Tipo
          </label>

          <p>{type || "Sin definir"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Estado
          </label>

          <p>
            {status === "published"
              ? "Publicado"
              : "Borrador"}
          </p>
        </div>

      </div>
    </section>
  );
}