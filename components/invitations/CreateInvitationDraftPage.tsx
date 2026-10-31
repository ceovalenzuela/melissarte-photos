"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { INVITATION_TEMPLATE_OPTIONS } from "@/lib/invitation-palettes";
import type { InvitationTemplateKey } from "@/types/invitation";

const TYPES = [
  { value: "wedding", label: "Boda", description: "Una celebración en pareja" },
  { value: "xv", label: "XV años", description: "Un día para recordar" },
  { value: "baby_shower", label: "Baby shower", description: "La llegada de alguien especial" },
  { value: "baptism", label: "Bautizo", description: "Un momento en familia" },
  { value: "other", label: "Otro evento", description: "Cuéntanos qué celebrarás" },
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
    const { data, error: createError } = await supabase.rpc("create_invitation_draft", { p_event_type: eventType, p_template_key: template });
    const row = data?.[0] as { access_token?: string } | undefined;
    if (createError || !row?.access_token) {
      const message = createError?.message ?? "";
      setError(message.includes("invitation_drafts_event_type_check") ? "Estamos terminando de habilitar este tipo de celebración. Inténtalo nuevamente más tarde." : "No fue posible crear tu invitación. Inténtalo nuevamente.");
      setBusy(false); return;
    }
    if (eventDate) {
      const { data: rows } = await supabase.rpc("get_invitation_draft", { p_access_token: row.access_token });
      const draft = rows?.[0];
      if (draft) {
        const { error: dateError } = await supabase.rpc("update_invitation_draft", {
          p_access_token: row.access_token, p_template_key: template,
          p_design_config: draft.design_config ?? {}, p_content_config: draft.content_config ?? {}, p_event_date: eventDate,
        });
        if (dateError) { router.push("/borrador/" + row.access_token + "?fecha=" + encodeURIComponent(eventDate)); return; }
      }
    }
    router.push("/borrador/" + row.access_token);
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F7F5F1] px-4 py-7 text-[#292720] sm:px-6 sm:py-10">
      <section className="w-full max-w-[38rem] rounded-[1.75rem] border border-[#E8DDCA] bg-white px-5 py-7 shadow-[0_12px_40px_rgba(57,47,34,0.07)] sm:px-9 sm:py-9">
        <div className="mb-6 flex justify-center"><img src="/me-logo.png" alt="Melissarte Events" className="h-auto w-28 object-contain sm:w-32" /></div>
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#A88249]">Vamos a crear algo especial</p>
          <h1 className="mt-2 font-[var(--font-display)] text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.45rem]">¿Qué vamos a celebrar?</h1>
          <p className="mt-2 text-sm leading-6 text-[#746A5D]">Elige el tipo de evento para comenzar. Después agregarás tus datos y escogerás el diseño de tu invitación.</p>
          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold text-[#38352F]">Tipo de celebración</legend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TYPES.map(type => { const selected = eventType === type.value; return (
                <button key={type.value} type="button" aria-pressed={selected} onClick={() => setEventType(type.value)}
                  className={`min-h-[5.1rem] rounded-2xl border px-3 py-3 text-left transition ${selected ? "border-[#A88750] bg-[#F8F4EC] ring-2 ring-[#A88750]/20" : "border-[#E7DCC8] bg-[#FFFEFC] hover:border-[#C7AD82]"}`}>
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-[#302D27]">{type.label}{selected && <span className="text-[#967443]">✓</span>}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-[#81776A]">{type.description}</span>
                </button>
              ); })}
            </div>
          </fieldset>
          <label className="mt-6 block text-sm font-semibold text-[#38352F]">¿Cuándo será tu evento? <span className="font-normal text-[#8A8074]">(opcional)</span>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} min={new Date().toISOString().slice(0,10)}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#E7DCC8] bg-[#FFFEFC] px-4 text-base font-normal outline-none transition focus:border-[#B8955B] focus:ring-2 focus:ring-[#B8955B]/15" />
            <span className="mt-1.5 block text-xs font-normal text-[#8A8074]">Si aún no tienes fecha, puedes agregarla después.</span>
          </label>
          <button onClick={createDraft} disabled={busy} className="mt-7 min-h-12 w-full rounded-full bg-[#263D4B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D3340] disabled:cursor-wait disabled:opacity-60">
            {busy ? "Preparando tu espacio..." : "Comenzar mi invitación"}
          </button>
          {error && <p role="alert" className="mt-4 rounded-xl border border-[#E8C7C1] bg-[#FFF7F5] px-4 py-3 text-sm leading-6 text-[#9C4036]">{error}</p>}
          <p className="mt-5 text-center text-xs leading-5 text-[#8A8074]">No necesitas crear una cuenta. Guarda tu enlace privado para continuar cuando quieras.</p>
        </div>
      </section>
    </main>
  );
}
