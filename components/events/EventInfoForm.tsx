"use client";

import { CalendarDays, CheckCircle2, Circle } from "lucide-react";

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
    <div className="space-y-5 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-[#1F1F1F]">
          Información del evento
        </h2>

        <p className="mt-1.5 text-sm text-[#7D7467]">
          Datos básicos que identifican esta galería.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#5C554B]">
            Título
          </label>

          <input
            className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition-colors focus:border-[#A88249]"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5C554B]">
            Fecha
          </label>

          <div className="relative">
            <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9287]" />
            <input
              type="date"
              className="w-full rounded-xl border border-[#E7DCC8] bg-white py-3 pl-10 pr-4 text-[#1F1F1F] outline-none transition-colors focus:border-[#A88249]"
              value={values.event_date ?? ""}
              onChange={(e) => update("event_date", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#5C554B]">
            Tipo de evento
          </label>

          <select
            className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition-colors focus:border-[#A88249]"
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

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[#5C554B]">
            URL pública
          </label>

          <input
            readOnly
            value={"/e/" + values.slug}
            className="w-full rounded-xl border border-[#E7DCC8] bg-[#F5F1EA] px-4 py-3 text-sm text-[#7D7467] outline-none"
          />

          <p className="mt-1.5 text-xs text-[#8B8378]">
            La URL se mantiene fija para no romper enlaces o códigos QR ya compartidos.
          </p>
        </div>
      </div>

      <div className="border-t border-[#E7DCC8] pt-5">
        <div className="mb-3">
          <p className="text-sm font-medium text-[#5C554B]">
            Mensajes de invitados
          </p>
          <p className="mt-1 text-xs text-[#8B8378]">
            Controla si los invitados pueden dejar mensajes escritos y de voz en esta galería.
          </p>
        </div>

        <button
          type="button"
          onClick={() => update("messages_enabled", !values.messages_enabled)}
          className={
            values.messages_enabled
              ? "flex w-full items-center justify-between gap-4 rounded-xl border border-[#B9CDBF] bg-[#F1F8F3] px-4 py-3 text-left text-[#316D45]"
              : "flex w-full items-center justify-between gap-4 rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-left text-[#6F665B] hover:bg-[#F8F4EE]"
          }
        >
          <span>
            <span className="block text-sm font-medium">
              {values.messages_enabled ? "Mensajes habilitados" : "Mensajes deshabilitados"}
            </span>
            <span className="mt-0.5 block text-xs opacity-80">
              {values.messages_enabled
                ? "Tus invitados pueden compartir palabras y voces."
                : "La sección de mensajes no se mostrará a los invitados."}
            </span>
          </span>
          <span
            className={
              values.messages_enabled
                ? "relative h-6 w-11 rounded-full bg-[#A88249]"
                : "relative h-6 w-11 rounded-full bg-[#D9D2C7]"
            }
            aria-hidden="true"
          >
            <span
              className={
                values.messages_enabled
                  ? "absolute left-6 top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                  : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"
              }
            />
          </span>
        </button>
      </div>

      <div className="border-t border-[#E7DCC8] pt-5">
        <div className="mb-3">
          <p className="text-sm font-medium text-[#5C554B]">
            Estado de la galería
          </p>
          <p className="mt-1 text-xs text-[#8B8378]">
            Cambiar el estado afecta las acciones disponibles para tus invitados.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => update("status", "published")}
            className={
              values.status === "published"
                ? "flex items-center gap-3 rounded-xl border border-[#B9CDBF] bg-[#F1F8F3] px-4 py-3 text-left text-[#316D45]"
                : "flex items-center gap-3 rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-left text-[#6F665B] hover:bg-[#F8F4EE]"
            }
          >
            {values.status === "published" ? <CheckCircle2 size={18} /> : <Circle size={18} /> }
            <span>
              <span className="block text-sm font-medium">Publicado</span>
              <span className="block text-xs opacity-80">Los invitados pueden participar.</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => update("status", "draft")}
            className={
              values.status === "draft"
                ? "flex items-center gap-3 rounded-xl border border-[#E3C98D] bg-[#FFF8E8] px-4 py-3 text-left text-[#8E6724]"
                : "flex items-center gap-3 rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-left text-[#6F665B] hover:bg-[#F8F4EE]"
            }
          >
            {values.status === "draft" ? <CheckCircle2 size={18} /> : <Circle size={18} /> }
            <span>
              <span className="block text-sm font-medium">Borrador</span>
              <span className="block text-xs opacity-80">Las acciones para invitados quedan deshabilitadas.</span>
            </span>
          </button>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="h-11 rounded-full bg-[#A88249] px-6 text-sm font-medium text-white transition-colors hover:bg-[#977640] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
