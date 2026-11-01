"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { INVITATION_TEMPLATE_OPTIONS } from "@/lib/invitation-palettes";
import type { InvitationTemplateKey } from "@/types/invitation";

const TYPES = [
  { value: "wedding", label: "Boda", description: "" },
  { value: "xv", label: "XV años", description: "" },
  { value: "baby_shower", label: "Baby shower", description: "" },
  { value: "baptism", label: "Bautizo", description: "" },
  { value: "other", label: "Otro evento", description: "" },
] as const;

export default function CreateInvitationDraftPage() {
  const [eventType, setEventType] = useState<(typeof TYPES)[number]["value"] | "">("");
  const [selectedPackage, setSelectedPackage] = useState<"essential" | "plus" | "">("");
  const [eventDate, setEventDate] = useState("");
  const template: InvitationTemplateKey = INVITATION_TEMPLATE_OPTIONS[0].key;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function createDraft() {
    if (!eventType) { setError("Selecciona el tipo de invitación para continuar."); return; }
    if (!selectedPackage) { setError("Selecciona el paquete que deseas."); return; }
    if (!eventDate) { setError("Selecciona la fecha de tu evento para comenzar."); return; }
    setBusy(true); setError("");
    const { data: row, error: createError } = await supabase.functions.invoke("create-invitation-draft", { body: { event_type: eventType, template_key: template, package: selectedPackage } });
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
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F7F5F1] px-4 py-4 text-[#292720] sm:px-6 sm:py-7">
      <section className="w-full max-w-[38rem] rounded-[1.75rem] border border-[#E8DDCA] bg-white px-5 py-5 shadow-[0_12px_40px_rgba(57,47,34,0.07)] sm:px-9 sm:py-8">
        <div className="mb-4 flex justify-center"><img src="/me-logo.png" alt="Melissarte Events" className="h-auto w-24 object-contain sm:w-28" /></div>
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#A88249]">Melissarte · Invitaciones digitales</p>
          <h1 className="mt-1.5 font-[var(--font-display)] text-[1.9rem] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[2.35rem]">Crea tu invitación gratis</h1>
          <p className="mt-1.5 text-sm leading-5 text-[#746A5D]">Personalízala a tu gusto y revisa una vista previa con tus propios datos antes de pagar.</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-[#F7F4ED] px-3.5 py-2.5 text-xs text-[#625A50]">
            <span className="inline-flex items-center gap-1.5"><span className="text-[#8A9B83]">✓</span> Crear y personalizar es gratis</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-[#8A9B83]">✓</span> Pagas hasta ver tu invitación</span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#38352F]">Conoce nuestros demos</p>
              <span className="text-[10px] text-[#8A8074]">Explóralos antes de empezar</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              <a href="https://events.melissartedecorativo.com/i/boda-sofia-y-alejandro" target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-xl border border-[#E7DCC8] bg-[#FFFEFC] transition hover:border-[#C7AD82] hover:shadow-sm">
                <span className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden bg-[#F1EEE5] px-2 text-center">
                  <span className="absolute inset-2 rounded-[3px] border border-[#CFC4AE]" />
                  <span className="text-[8px] uppercase tracking-[.24em] text-[#81917D]">Sofía & Alejandro</span>
                  <span className="my-1 font-[var(--font-display)] text-[clamp(1.2rem,5vw,1.65rem)] italic leading-none text-[#334A4B]">Nuestra boda</span>
                  <span className="text-[8px] uppercase tracking-[.2em] text-[#9B8055]">Una historia para celebrar</span>
                  <span className="mt-2 text-[11px] text-[#B3925F]">✦　❧　✦</span>
                </span>
                <span className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="min-w-0"><span className="block text-xs font-semibold text-[#302D27]">Boda</span><span className="block text-[10px] text-[#81776A]">Editorial · Salvia y marfil</span></span>
                  <span className="shrink-0 text-[10px] font-semibold text-[#967443] group-hover:underline">Explorar ↗</span>
                </span>
              </a>
              <a href="https://events.melissartedecorativo.com/i/xv" target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-xl border border-[#E7DCC8] bg-[#FFFEFC] transition hover:border-[#C7AD82] hover:shadow-sm">
                <span className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden bg-[#F3E9EB] px-2 text-center">
                  <span className="absolute inset-2 rounded-[3px] border border-[#D8B9C1]" />
                  <span className="text-[8px] uppercase tracking-[.24em] text-[#A97986]">Una noche especial</span>
                  <span className="my-1 font-[var(--font-display)] text-[clamp(1.2rem,5vw,1.65rem)] italic leading-none text-[#754E5E]">Mis XV años</span>
                  <span className="text-[8px] uppercase tracking-[.2em] text-[#A97986]">Una noche para brillar</span>
                  <span className="mt-2 text-[11px] text-[#B88B66]">✦　♕　✦</span>
                </span>
                <span className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="min-w-0"><span className="block text-xs font-semibold text-[#302D27]">XV años</span><span className="block text-[10px] text-[#81776A]">Romántico · Rosa y champagne</span></span>
                  <span className="shrink-0 text-[10px] font-semibold text-[#967443] group-hover:underline">Explorar ↗</span>
                </span>
              </a>
            </div>
          </div>
          <div className="mt-5 border-t border-[#EEE7DC] pt-4">
            <p className="text-sm font-semibold text-[#38352F]">Comienza tu invitación</p>
            <p className="mt-1 text-xs leading-5 text-[#81776A]">Selecciona los datos iniciales. Después podrás personalizar el diseño y ver tu vista previa.</p>
          </div>
          <fieldset className="mt-5">
            <legend className="mb-3 text-sm font-semibold text-[#38352F]">Tipo de celebración</legend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TYPES.map(type => { const selected = eventType === type.value; return (
                <button key={type.value} type="button" aria-pressed={selected} onClick={() => setEventType(type.value)}
                  className={`min-h-12 rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-[#A88750] bg-[#F8F4EC] ring-2 ring-[#A88750]/20" : "border-[#E7DCC8] bg-[#FFFEFC] hover:border-[#C7AD82]"}`}>
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-[#302D27]">{type.label}{selected && <span className="text-[#967443]">✓</span>}</span>
                  
                </button>
              ); })}
            </div>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="mb-3 text-sm font-semibold text-[#38352F]">Elige tu paquete <span className="text-[#A35B4D]">*</span></legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[{value:"essential" as const,label:"Esencial",price:"$199 MXN",detail:"Invitación personalizada y confirmaciones por WhatsApp."},{value:"plus" as const,label:"Plus",price:"$349 MXN",detail:"Todo Esencial + lista de invitados, envío y seguimiento de confirmaciones.",tag:"Más completo"}].map(option=>{const selected=selectedPackage===option.value;return (
                <button key={option.value} type="button" aria-pressed={selected} onClick={()=>setSelectedPackage(option.value)} className={`relative rounded-2xl border p-4 text-left transition ${selected?"border-[#A88750] bg-[#F8F4EC] ring-2 ring-[#A88750]/20":"border-[#E7DCC8] bg-[#FFFEFC] hover:border-[#C7AD82]"}`}>
                  {option.tag && <span className="absolute -top-2.5 right-3 rounded-full bg-[#E8D8B8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.08em] text-[#725A36]">{option.tag}</span>}
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-[#302D27]">{option.label}<span className="text-[#967443]">{option.price}</span></span>
                  <span className="mt-2 block text-xs leading-5 text-[#81776A]">{option.detail}</span>
                  {selected && <span className="mt-2 inline-block text-[11px] font-semibold text-[#806747]">✓ Seleccionado</span>}
                </button>
              );})}
            </div>
          </fieldset>
          <label className="mt-5 block text-sm font-semibold text-[#38352F]">Fecha de tu evento <span className="text-[#A35B4D]">*</span>
            <input required type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} min={new Date().toISOString().slice(0,10)}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#E7DCC8] bg-[#FFFEFC] px-4 text-base font-normal outline-none transition focus:border-[#B8955B] focus:ring-2 focus:ring-[#B8955B]/15" />
            
          </label>
          <button onClick={createDraft} disabled={busy || !eventType || !selectedPackage || !eventDate} className="mt-5 min-h-12 w-full rounded-full bg-[#263D4B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D3340] disabled:cursor-not-allowed disabled:bg-[#263D4B]/65 disabled:shadow-none">
            {busy ? "Preparando tu espacio..." : "Comenzar mi invitación"}
          </button>
          <p className="mt-2 text-center text-[11px] leading-4 text-[#81776A]">{!eventType ? "Selecciona el tipo de celebración" : !selectedPackage ? "Elige tu paquete" : !eventDate ? "Indica la fecha de tu evento" : "Todo listo para comenzar · Sin costo de creación"}</p>
          {error && <p role="alert" className="mt-4 rounded-xl border border-[#E8C7C1] bg-[#FFF7F5] px-4 py-3 text-sm leading-6 text-[#9C4036]">{error}</p>}
          <p className="mt-3 text-center text-[11px] text-[#8A8074]">Sin crear una cuenta · Podrás continuar con tu enlace privado</p>
        </div>
      </section>
    </main>
  );
}
