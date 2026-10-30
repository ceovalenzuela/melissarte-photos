"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { INVITATION_TEMPLATE_OPTIONS } from "@/lib/invitation-palettes";
import type { InvitationTemplateKey } from "@/types/invitation";

const TYPES = [
  { value: "wedding", label: "Boda" },
  { value: "xv", label: "XV años" },
  { value: "baby_shower", label: "Baby shower" },
  { value: "baptism", label: "Bautizo" },
  { value: "other", label: "Otro" },
] as const;

export default function CreateInvitationDraftPage() {
  const [eventType, setEventType] = useState<(typeof TYPES)[number]["value"]>("wedding");
  const [eventDate, setEventDate] = useState("");
  const template: InvitationTemplateKey = INVITATION_TEMPLATE_OPTIONS[0].key;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function createDraft() {
    setBusy(true); setError("");
    const { data, error: createError } = await supabase.rpc("create_invitation_draft", {
      p_event_type: eventType,
      p_template_key: template,
    });
    const row = data?.[0] as { access_token?: string } | undefined;
    if (createError || !row?.access_token) {
      setError(createError?.message ?? "No fue posible crear tu borrador.");
      setBusy(false);
      return;
    }
    const { data: draftRows } = await supabase.rpc("get_invitation_draft", { p_access_token: row.access_token });
    const draft = draftRows?.[0];
    if (draft && eventDate) {
      const { error: dateError } = await supabase.rpc("update_invitation_draft", {
        p_access_token: row.access_token,
        p_template_key: template,
        p_design_config: draft.design_config ?? {},
        p_content_config: draft.content_config ?? {},
        p_event_date: eventDate,
      });
      if (dateError) { router.push("/borrador/" + row.access_token + "?fecha=" + encodeURIComponent(eventDate)); return; }
    }
    router.push("/borrador/" + row.access_token);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-10 text-[#27251F]">
      <section className="w-full max-w-lg rounded-3xl border border-[#E7DCC8] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#A88249]">Melissarte Events</p>
        <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold">Comienza tu invitación</h1>
        <p className="mt-2 text-sm leading-6 text-[#746A5D]">Selecciona el tipo de celebración y la fecha de tu evento. Después podrás agregar los detalles y elegir el diseño que más te guste.</p>
        <label className="mt-6 block text-sm font-medium">Tipo de evento
          <select value={eventType} onChange={e=>setEventType(e.target.value as typeof eventType)} className="mt-2 w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-sm">
            {TYPES.map(type=><option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium">Fecha del evento
          <input required type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} min={new Date().toISOString().slice(0,10)} className="mt-2 w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-sm" />
        </label>
        <button onClick={createDraft} disabled={busy || !eventDate} className="mt-6 w-full rounded-full bg-[#263D4B] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Preparando..." : "Crear mi invitación"}</button>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <p className="mt-4 text-center text-xs leading-5 text-[#8A8074]">Podrás guardar tu avance y regresar con tu enlace privado. No necesitas crear una cuenta.</p>
      </section>
    </main>
  );
}
