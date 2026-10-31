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
      const message = createError?.message ?? "";
      setError(message.includes("invitation_drafts_event_type_check")
        ? "Estamos terminando de habilitar este tipo de celebración. Por favor, inténtalo nuevamente más tarde."
        : "No fue posible crear tu invitación. Inténtalo nuevamente.");
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
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F7F5F1] px-4 py-8 text-[#292720] sm:px-6 sm:py-12">
      <section className="w-full max-w-[34rem] rounded-[2rem] border border-[#E8DDCA] bg-white px-6 py-8 shadow-[0_12px_40px_rgba(57,47,34,0.07)] sm:px-10 sm:py-10">
        <div className="mb-7 flex justify-center">
          <img src="/me-logo.png" alt="Melissarte Events" className="h-auto w-32 object-contain sm:w-36" />
        </div>
        <div className="mx-auto max-w-md">
          <h1 className="font-[var(--font-display)] text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.6rem]">Comienza tu invitación</h1>
          <p className="mt-4 text-[1rem] leading-7 text-[#746A5D] sm:text-[1.05rem]">Selecciona el tipo de celebración y la fecha de tu evento. Después podrás agregar los detalles y elegir el diseño que más te guste.</p>
          <div className="mt-8 space-y-5">
            <label className="block text-sm font-semibold tracking-[.01em] text-[#38352F]">Tipo de evento
              <select value={eventType} onChange={e=>setEventType(e.target.value as typeof eventType)} className="mt-2.5 min-h-14 w-full rounded-2xl border border-[#E7DCC8] bg-[#FFFEFC] px-4 text-base font-normal text-[#302D27] outline-none transition focus:border-[#B8955B] focus:ring-2 focus:ring-[#B8955B]/15">
                {TYPES.map(type=><option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold tracking-[.01em] text-[#38352F]">Fecha del evento
              <input required type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} min={new Date().toISOString().slice(0,10)} className="mt-2.5 min-h-14 w-full rounded-2xl border border-[#E7DCC8] bg-[#FFFEFC] px-4 text-base font-normal text-[#302D27] outline-none transition focus:border-[#B8955B] focus:ring-2 focus:ring-[#B8955B]/15" />
            </label>
          </div>
          <button onClick={createDraft} disabled={busy || !eventDate} className="mt-8 min-h-14 w-full rounded-full bg-[#263D4B] px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#1D3340] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Preparando tu invitación..." : "Crear mi invitación"}</button>
          {error && <p role="alert" className="mt-4 rounded-xl border border-[#E8C7C1] bg-[#FFF7F5] px-4 py-3 text-sm leading-6 text-[#9C4036]">{error}</p>}
          <p className="mt-6 text-center text-sm leading-6 text-[#8A8074]">Podrás guardar tu avance y regresar con tu enlace privado. No necesitas crear una cuenta.</p>
        </div>
      </section>
    </main>
  );}
