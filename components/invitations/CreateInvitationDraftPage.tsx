"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TYPES = [
  { value: "wedding", label: "Boda", template: "wedding_editorial" },
  { value: "xv", label: "XV años", template: "xv_gala" },
  { value: "baby_shower", label: "Baby shower", template: "baby_soft" },
  { value: "baptism", label: "Bautizo", template: "baptism_light" },
] as const;

export default function CreateInvitationDraftPage() {
  const [eventType, setEventType] = useState<(typeof TYPES)[number]["value"]>("wedding");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function createDraft() {
    setBusy(true); setError("");
    const selected = TYPES.find(item => item.value === eventType)!;
    const { data, error: createError } = await supabase.rpc("create_invitation_draft", {
      p_event_type: selected.value,
      p_template_key: selected.template,
    });
    const row = data?.[0] as { access_token?: string } | undefined;
    if (createError || !row?.access_token) {
      setError(createError?.message ?? "No fue posible crear tu borrador.");
      setBusy(false);
      return;
    }
    router.push("/borrador/" + row.access_token);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-10 text-[#27251F]">
      <section className="w-full max-w-lg rounded-3xl border border-[#E7DCC8] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#A88249]">Melissarte Events</p>
        <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold">Comienza tu invitación</h1>
        <p className="mt-2 text-sm leading-6 text-[#746A5D]">Elige el tipo de evento para preparar tu diseño y comenzar a personalizarlo.</p>
        <label className="mt-6 block text-sm font-medium">Tipo de evento
          <select value={eventType} onChange={e=>setEventType(e.target.value as typeof eventType)} className="mt-2 w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-sm">
            {TYPES.map(type=><option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </label>
        <button onClick={createDraft} disabled={busy} className="mt-6 w-full rounded-full bg-[#263D4B] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Preparando..." : "Crear mi invitación"}</button>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <p className="mt-4 text-center text-xs leading-5 text-[#8A8074]">Podrás guardar tu avance y regresar con tu enlace privado. No necesitas crear una cuenta.</p>
      </section>
    </main>
  );
}
