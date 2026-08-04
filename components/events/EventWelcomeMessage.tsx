"use client";

import { useState } from "react";

import { updateEvent } from "@/lib/events";
import { Event } from "@/types/event";

interface Props {
  values: Event;
  onChange: (values: Event) => void;
}

export default function EventWelcomeMessage({
  values,
  onChange,
}: Props) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      await updateEvent(values.id, {
        welcome_message: values.welcome_message,
      });

      alert("Mensaje guardado");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-[#1F1F1F]">
          Mensaje de bienvenida
        </h2>

        <p className="mt-2 text-sm text-[#7D7467]">
          Este mensaje aparecerá en la parte superior de la galería para recibir a tus invitados.
        </p>
      </div>

      <textarea
        value={values.welcome_message ?? ""}
        onChange={(e) =>
          onChange({
            ...values,
            welcome_message: e.target.value,
          })
        }
        rows={5}
        placeholder="Escribe el mensaje que verán tus invitados..."
        className="
          w-full
          rounded-2xl
          border
          border-[#E7DCC8]
          bg-white
          px-4
          py-3
          text-[#1F1F1F]
          outline-none
          transition-colors
          resize-none
          focus:border-[#B08D57]
        "
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="
          h-12
          rounded-full
          bg-neutral-800
          px-7
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
          : "Guardar mensaje"}
      </button>
    </div>
  );
}