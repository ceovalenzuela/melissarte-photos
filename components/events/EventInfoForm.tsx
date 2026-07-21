"use client";

import { Event } from "@/types/event";

interface EventInfoFormProps {
  values: Event;
  onChange: (values: Event) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function EventInfoForm({
  values,
  onChange,
  onSave,
  saving = false,
}: EventInfoFormProps) {
  function update<K extends keyof Event>(key: K, value: Event[K]) {
    onChange({
      ...values,
      [key]: value,
    });
  }

  return (
    <div className="space-y-5 rounded-xl border bg-white p-6">

      <h2 className="text-lg font-semibold">
        Información del evento
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Título
        </label>

        <input
          className="w-full rounded-md border px-3 py-2"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Slug
        </label>

        <input
          className="w-full rounded-md border px-3 py-2"
          value={values.slug}
          onChange={(e) => update("slug", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Fecha
        </label>

        <input
          type="date"
          className="w-full rounded-md border px-3 py-2"
          value={values.event_date ?? ""}
          onChange={(e) => update("event_date", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Tipo
        </label>

        <select
          className="w-full rounded-md border px-3 py-2"
          value={values.type ?? ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="wedding">Boda</option>
          <option value="xv">XV Años</option>
          <option value="birthday">Cumpleaños</option>
          <option value="corporate">Corporativo</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Estado
        </label>

        <select
          className="w-full rounded-md border px-3 py-2"
          value={values.status}
          onChange={(e) =>
            update("status", e.target.value as "draft" | "published")
          }
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}