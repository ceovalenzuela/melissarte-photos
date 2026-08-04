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
  function update<K extends keyof Event>(
    key: K,
    value: Event[K]
  ) {
    onChange({
      ...values,
      [key]: value,
    });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-[#1F1F1F]">
          Información del evento
        </h2>

        <p className="mt-2 text-sm text-[#7D7467]">
          Actualiza la información principal del evento.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#5C554B]">
          Título
        </label>

        <input
          className="
            w-full
            rounded-xl
            border
            border-[#E7DCC8]
            bg-white
            px-4
            py-3
            text-[#1F1F1F]
            outline-none
            transition-colors
            focus:border-[#B08D57]
          "
          value={values.title}
          onChange={(e) =>
            update("title", e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#5C554B]">
          Slug
        </label>

        <input
          className="
            w-full
            rounded-xl
            border
            border-[#E7DCC8]
            bg-white
            px-4
            py-3
            text-[#1F1F1F]
            outline-none
            transition-colors
            focus:border-[#B08D57]
          "
          value={values.slug}
          onChange={(e) =>
            update("slug", e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#5C554B]">
          Fecha
        </label>

        <input
          type="date"
          className="
            w-full
            rounded-xl
            border
            border-[#E7DCC8]
            bg-white
            px-4
            py-3
            text-[#1F1F1F]
            outline-none
            transition-colors
            focus:border-[#B08D57]
          "
          value={values.event_date ?? ""}
          onChange={(e) =>
            update("event_date", e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#5C554B]">
          Tipo
        </label>

        <select
          className="
            w-full
            rounded-xl
            border
            border-[#E7DCC8]
            bg-white
            px-4
            py-3
            text-[#1F1F1F]
            outline-none
            transition-colors
            focus:border-[#B08D57]
          "
          value={values.type ?? ""}
          onChange={(e) =>
            update("type", e.target.value)
          }
        >
          <option value="">
            Seleccionar...
          </option>
          <option value="wedding">
            Boda
          </option>
          <option value="xv">
            XV Años
          </option>
          <option value="birthday">
            Cumpleaños
          </option>
          <option value="corporate">
            Corporativo
          </option>
          <option value="other">
            Otro
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#5C554B]">
          Estado
        </label>

        <select
          className="
            w-full
            rounded-xl
            border
            border-[#E7DCC8]
            bg-white
            px-4
            py-3
            text-[#1F1F1F]
            outline-none
            transition-colors
            focus:border-[#B08D57]
          "
          value={values.status}
          onChange={(e) =>
            update(
              "status",
              e.target.value as
                | "draft"
                | "published"
            )
          }
        >
          <option value="draft">
            Borrador
          </option>

          <option value="published">
            Publicado
          </option>
        </select>
      </div>

      <div className="pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="
            rounded-full
            bg-neutral-800
            px-6
            py-3
            text-sm
            font-medium
            text-white
            transition-colors
            duration-200
            hover:bg-black
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {saving
            ? "Guardando..."
            : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}