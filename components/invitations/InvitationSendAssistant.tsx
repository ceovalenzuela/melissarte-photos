"use client";

import { useMemo, useState } from "react";
import { Copy, MessageCircle, Plus, Share2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { InvitationStatus } from "@/types/invitation";

type Guest = { id: string; name: string; phone: string };

interface Props {
  eventTitle: string;
  invitationSlug: string;
  status: InvitationStatus;
  hostNames?: string;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 12 && digits.startsWith("52")) return digits;
  if (digits.length === 13 && digits.startsWith("521")) return digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : "";
}

function parseGuestLines(value: string): Guest[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/[;,\t]/).map((part) => part.trim());
      const phoneIndex = parts.findIndex((part) => normalizePhone(part) !== "");
      if (phoneIndex < 0) return null;
      const phone = parts[phoneIndex];
      const name = parts.filter((_, partIndex) => partIndex !== phoneIndex).join(" ").trim();
      return { id: `import-${Date.now()}-${index}-${phone}`, name, phone };
    })
    .filter((guest): guest is Guest => Boolean(guest));
}

export default function InvitationSendAssistant({ eventTitle, invitationSlug, status, hostNames }: Props) {
  const [guests, setGuests] = useState<Guest[]>([{ id: "guest-1", name: "", phone: "" }]);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState(
    "¡Hola {{nombre}}! 💌 Queremos invitarte a {{evento}}. Aquí puedes ver los detalles y confirmar tu asistencia: {{enlace}}. {{anfitriones}}¡Esperamos verte pronto!"
  );
  const invitationUrl = useMemo(() => {
    if (typeof window === "undefined") return `/i/${encodeURIComponent(invitationSlug)}`;
    return `${window.location.origin}/i/${encodeURIComponent(invitationSlug)}`;
  }, [invitationSlug]);

  function messageFor(name: string, generic = false) {
    const greeting = generic ? "¡Hola!" : name.trim() ? `¡Hola ${name.trim()}!` : "¡Hola!";
    return message
      .replace(/¡Hola\s*\{\{nombre\}\}!/g, greeting)
      .replace(/\{\{nombre\}\}/g, name.trim())
      .replace(/\{\{evento\}\}/g, eventTitle)
      .replace(/\{\{enlace\}\}/g, invitationUrl)
      .replace(/\{\{anfitriones\}\}/g, hostNames?.trim() ? `Con cariño, ${hostNames.trim()}. ` : "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  function updateGuest(id: string, field: "name" | "phone", value: string) {
    setGuests((current) => current.map((guest) => guest.id === id ? { ...guest, [field]: value } : guest));
  }

  function addGuest() {
    setGuests((current) => [...current, { id: `guest-${Date.now()}-${current.length}`, name: "", phone: "" }]);
  }

  function importGuests() {
    const parsed = parseGuestLines(importText);
    if (!parsed.length) {
      toast.error("No encontré teléfonos válidos. Usa una línea por invitado: nombre, teléfono.");
      return;
    }
    setGuests((current) => {
      const existing = current.filter((guest) => guest.name.trim() || guest.phone.trim());
      return [...existing, ...parsed];
    });
    setImportText("");
    toast.success(`Se agregaron ${parsed.length} invitado(s).`);
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(success);
    } catch {
      toast.error("No fue posible copiar. Intenta desde tu navegador.");
    }
  }

  async function shareInvitation() {
    const text = messageFor("", true);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Invitación: ${eventTitle}`, text, url: invitationUrl });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await copyText(text, "Mensaje copiado para compartir.");
  }

  return (
    <section className="rounded-2xl border border-[#E7DCC8] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E7F4ED] text-[#28734D]"><MessageCircle size={19} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#332B27]">Envío asistido de invitaciones</h3>
          <p className="mt-1 text-sm leading-6 text-[#7D7467]">Prepara el mensaje y abre cada conversación de WhatsApp con el texto listo. Tú decides cuándo enviarlo; no usamos una API ni enviamos mensajes automáticamente.</p>
        </div>
      </div>

      {status !== "published" ? (
        <div className="mt-4 rounded-xl bg-[#FFF4DD] p-4 text-sm leading-6 text-[#805E24]">
          Publica la invitación para habilitar el envío y compartir el enlace definitivo.
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-[#E7DCC8] bg-[#FDFBF8] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7D7467]">Enlace público</p>
            <p className="mt-1 break-all text-sm text-[#332B27]">{invitationUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void copyText(invitationUrl, "Enlace de invitación copiado.")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E7DCC8] bg-white px-4 py-2 text-sm font-medium text-[#5C554B]"><Copy size={15} />Copiar enlace</button>
              <button type="button" onClick={() => void shareInvitation()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#28734D] px-4 py-2 text-sm font-semibold text-white"><Share2 size={15} />Compartir</button>
              <button type="button" onClick={() => void copyText(messageFor("", true), "Mensaje copiado. Puedes pegarlo en un chat o grupo de WhatsApp.")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E7DCC8] bg-white px-4 py-2 text-sm font-medium text-[#5C554B]"><Copy size={15} />Copiar mensaje</button>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-[#4E463D]">
              Mensaje para WhatsApp
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={1200} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm leading-6 text-[#332B27] outline-none focus:border-[#A88249]" />
            </label>
            <p className="mt-2 text-xs leading-5 text-[#8A8074]">Variables disponibles: <code>{"{{nombre}}"}</code>, <code>{"{{evento}}"}</code>, <code>{"{{enlace}}"}</code> y <code>{"{{anfitriones}}"}</code>.</p>
          </div>

          <div className="mt-5 border-t border-[#F0E9DF] pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-[#332B27]">Lista de invitados</h4>
                <p className="mt-1 text-xs leading-5 text-[#7D7467]">Agrega nombres y teléfonos con lada internacional. Los números mexicanos de 10 dígitos se preparan con lada 52.</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F7F3EC] px-3 py-1.5 text-xs font-medium text-[#5C554B]"><Users size={13} />{guests.filter((guest) => guest.name.trim() || guest.phone.trim()).length}</span>
            </div>

            <details className="mt-4 rounded-xl border border-dashed border-[#D9CBB6] p-3">
              <summary className="cursor-pointer text-sm font-medium text-[#5C554B]">Pegar una lista de invitados</summary>
              <p className="mt-2 text-xs leading-5 text-[#7D7467]">Una persona por línea, en formato nombre, teléfono. También puedes separar con punto y coma o tabulador.</p>
              <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={4} placeholder={"Ana López, 8112345678\nLuis García, 528112345678"} className="mt-3 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm outline-none focus:border-[#A88249]" />
              <button type="button" onClick={importGuests} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm font-medium text-[#5C554B]"><Plus size={15} />Agregar lista</button>
            </details>

            <div className="mt-4 space-y-3">
              {guests.map((guest, index) => {
                const phone = normalizePhone(guest.phone);
                const valid = Boolean(phone);
                const whatsappUrl = valid ? `https://wa.me/${phone}?text=${encodeURIComponent(messageFor(guest.name))}` : "";
                return (
                  <div key={guest.id} className="grid gap-2 rounded-xl border border-[#F0E9DF] bg-[#FDFBF8] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end">
                    <label className="block text-xs font-medium text-[#7D7467]">
                      Nombre
                      <input value={guest.name} onChange={(event) => updateGuest(guest.id, "name", event.target.value)} maxLength={80} placeholder={`Invitado ${index + 1}`} className="mt-1 block min-h-10 w-full rounded-lg border border-[#E7DCC8] bg-white px-3 text-sm text-[#332B27] outline-none focus:border-[#A88249]" />
                    </label>
                    <label className="block text-xs font-medium text-[#7D7467]">
                      Teléfono
                      <input value={guest.phone} onChange={(event) => updateGuest(guest.id, "phone", event.target.value)} type="tel" maxLength={25} placeholder="Ej. 8112345678" className="mt-1 block min-h-10 w-full rounded-lg border border-[#E7DCC8] bg-white px-3 text-sm text-[#332B27] outline-none focus:border-[#A88249]" />
                    </label>
                    <a href={whatsappUrl || undefined} target="_blank" rel="noreferrer" aria-disabled={!valid} className={valid ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#28734D] px-4 py-2 text-sm font-semibold text-white" : "inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#D9D9D9] px-4 py-2 text-sm font-semibold text-white"}><MessageCircle size={15} />WhatsApp</a>
                    <button type="button" onClick={() => setGuests((current) => current.filter((item) => item.id !== guest.id))} aria-label={`Quitar invitado ${index + 1}`} className="inline-flex min-h-10 items-center justify-center rounded-full px-3 text-[#8A8074] hover:bg-[#F0E9DF]"><Trash2 size={16} /></button>
                    {guest.phone.trim() && !valid && <p className="text-xs text-red-600 sm:col-span-2">Revisa el teléfono e incluye la lada del país.</p>}
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={addGuest} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm font-medium text-[#5C554B]"><Plus size={15} />Agregar invitado</button>
            <p className="mt-3 text-xs leading-5 text-[#8A8074]">Por privacidad, esta lista solo vive en esta pantalla y no se guarda en el servidor. WhatsApp abrirá una conversación por invitado; revisa el mensaje y pulsa enviar manualmente.</p>
          </div>
        </>
      )}
    </section>
  );
}
