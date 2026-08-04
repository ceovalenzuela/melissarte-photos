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
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold">
        Mensaje de bienvenida
      </h2>

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
        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-black"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar mensaje"}
      </button>
    </div>
  );
}