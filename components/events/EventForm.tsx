"use client";

type Props = {
  title: string;
  eventDate: string;
  loading: boolean;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSubmit: () => void;
};

export default function EventForm({
  title,
  eventDate,
  loading,
  onTitleChange,
  onDateChange,
  onSubmit,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <h2 className="text-xl font-semibold mb-5">
        Nuevo evento
      </h2>

      <label className="block mb-2">
        Nombre del evento
      </label>

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="border rounded-lg w-full p-3 mb-5"
      />

      <label className="block mb-2">
        Fecha
      </label>

      <input
        type="date"
        value={eventDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="border rounded-lg w-full p-3"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-3 rounded-lg mt-6 hover:bg-blue-700"
      >
        {loading ? "Guardando..." : "Crear evento"}
      </button>
    </div>
  );
}