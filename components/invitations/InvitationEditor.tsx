"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/types/event";
import type { InvitationContent, InvitationDesign, InvitationStatus } from "@/types/invitation";

interface InvitationRow {
  invitation_id: string;
  event_id: string;
  slug: string;
  template_key: string;
  design_config: InvitationDesign;
  content_config: InvitationContent;
  rsvp_enabled: boolean;
  max_party_size: number;
  status: InvitationStatus;
}

interface Props {
  event: Event;
  organizerToken: string;
}

const emptyContent = (event: Event): InvitationContent => ({
  headline: event.title,
  subtitle: "Un día especial que queremos compartir contigo",
  host_names: "",
  introduction: "Nos llena de alegría invitarte a celebrar con nosotros.",
  ceremony_time: "",
  ceremony_venue: "",
  ceremony_address: "",
  reception_time: "",
  reception_venue: "",
  reception_address: "",
  dress_code: "",
  rsvp_deadline: "",
  closing_note: "Será un gusto contar con tu presencia.",
});

const emptyDesign: InvitationDesign = {
  accent_color: "#9A7358",
  background_color: "#FBF7F1",
  text_color: "#332B27",
};

export default function InvitationEditor({ event, organizerToken }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateKey, setTemplateKey] = useState("classic");
  const [content, setContent] = useState<InvitationContent>(() => emptyContent(event));
  const [design, setDesign] = useState<InvitationDesign>(emptyDesign);
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [maxPartySize, setMaxPartySize] = useState(2);
  const [status, setStatus] = useState<InvitationStatus>("draft");

  useEffect(() => {
    let active = true;
    async function loadInvitation() {
      const { data, error } = await supabase.rpc("get_invitation_for_organizer", {
        p_event_id: event.id,
        p_organizer_token: organizerToken,
      });
      if (!active) return;
      if (error) {
        toast.error("No fue posible cargar la invitación.");
        setLoaded(true);
        return;
      }
      const row = (data?.[0] as InvitationRow | undefined) ?? null;
      if (row) {
        setTemplateKey(row.template_key);
        setContent({ ...emptyContent(event), ...(row.content_config ?? {}) });
        setDesign({ ...emptyDesign, ...(row.design_config ?? {}) });
        setRsvpEnabled(row.rsvp_enabled);
        setMaxPartySize(row.max_party_size);
        setStatus(row.status);
      }
      setLoaded(true);
    }
    void loadInvitation();
    return () => { active = false; };
  }, [event, organizerToken]);

  function updateContent<K extends keyof InvitationContent>(key: K, value: InvitationContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateDesign<K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) {
    setDesign((current) => ({ ...current, [key]: value }));
  }

  async function saveInvitation(nextStatus = status) {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("save_invitation_with_token", {
        p_event_id: event.id,
        p_organizer_token: organizerToken,
        p_slug: event.slug,
        p_template_key: templateKey,
        p_design_config: design,
        p_content_config: content,
        p_rsvp_enabled: rsvpEnabled,
        p_max_party_size: maxPartySize,
        p_status: nextStatus,
      });
      if (error) throw error;
      if (!data?.length) throw new Error("No se recibió confirmación del guardado.");
      setStatus(nextStatus);
      toast.success(nextStatus === "published" ? "Invitación publicada." : "Borrador guardado.");
    } catch (error) {
      console.error("Error guardando invitación:", error);
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la invitación.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]";
  const labelClass = "block text-sm font-medium text-[#4E463D]";

  return (
    <section className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7DCC8] px-5 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2 text-[#A88249]">
            <Sparkles size={19} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Nueva función</p>
          </div>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-[#332B27]">Invitación digital</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#7D7467]">Personaliza los detalles y comparte una invitación con confirmación de asistencia.</p>
        </div>
        {status === "published" && (
          <a href={`/i/${encodeURIComponent(event.slug)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC8] bg-white px-4 py-2.5 text-sm font-medium text-[#5C554B]">
            Ver invitación <ExternalLink size={15} />
          </a>
        )}
      </div>

      {!loaded ? (
        <p className="px-6 py-8 text-sm text-[#7D7467]">Cargando configuración...</p>
      ) : (
        <div className="space-y-8 p-5 sm:p-7">
          <section>
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Enlace y publicación</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Enlace de la invitación</label>
                <div className="mt-1.5 rounded-xl border border-[#E7DCC8] bg-[#F7F3EC] px-3.5 py-3 text-sm text-[#5C554B]">
                  /i/{event.slug}
                </div>
                <p className="mt-1 text-xs text-[#8A8074]">La invitación comparte la identidad del evento y mantiene el enlace de la galería.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="invitation-template">Diseño base</label>
                <select id="invitation-template" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} className={inputClass}>
                  <option value="classic">Clásico elegante</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-4">
              <label className="flex items-center gap-2 text-sm text-[#5C554B]">
                <input type="checkbox" checked={rsvpEnabled} onChange={(e) => setRsvpEnabled(e.target.checked)} className="h-4 w-4 accent-[#A88249]" />
                Permitir confirmar asistencia
              </label>
              <label className="flex items-center gap-2 text-sm text-[#5C554B]">
                Máximo de asistentes
                <select value={maxPartySize} onChange={(e) => setMaxPartySize(Number(e.target.value))} className="rounded-lg border border-[#E7DCC8] bg-white px-2 py-1.5">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-7">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Texto de la invitación</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título principal" value={content.headline ?? ""} onChange={(v) => updateContent("headline", v)} />
              <Field label="Nombres de festejados/anfitriones" value={content.host_names ?? ""} onChange={(v) => updateContent("host_names", v)} />
              <Field label="Subtítulo" value={content.subtitle ?? ""} onChange={(v) => updateContent("subtitle", v)} />
              <Field label="Mensaje de cierre" value={content.closing_note ?? ""} onChange={(v) => updateContent("closing_note", v)} />
              <div className="sm:col-span-2">
                <label className={labelClass}>Mensaje de invitación</label>
                <textarea rows={3} value={content.introduction ?? ""} onChange={(e) => updateContent("introduction", e.target.value)} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-7">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Ceremonia y recepción</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hora de ceremonia" value={content.ceremony_time ?? ""} onChange={(v) => updateContent("ceremony_time", v)} placeholder="Ej. 17:00 h" />
              <Field label="Lugar de ceremonia" value={content.ceremony_venue ?? ""} onChange={(v) => updateContent("ceremony_venue", v)} />
              <Field label="Dirección de ceremonia" value={content.ceremony_address ?? ""} onChange={(v) => updateContent("ceremony_address", v)} />
              <Field label="Hora de recepción" value={content.reception_time ?? ""} onChange={(v) => updateContent("reception_time", v)} placeholder="Ej. 19:00 h" />
              <Field label="Lugar de recepción" value={content.reception_venue ?? ""} onChange={(v) => updateContent("reception_venue", v)} />
              <Field label="Dirección de recepción" value={content.reception_address ?? ""} onChange={(v) => updateContent("reception_address", v)} />
              <Field label="Código de vestimenta" value={content.dress_code ?? ""} onChange={(v) => updateContent("dress_code", v)} />
              <Field label="Fecha límite para confirmar" value={content.rsvp_deadline ?? ""} onChange={(v) => updateContent("rsvp_deadline", v)} placeholder="Ej. 10 de noviembre" />
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-7">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Colores</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField label="Color de acento" value={design.accent_color ?? "#9A7358"} onChange={(v) => updateDesign("accent_color", v)} />
              <ColorField label="Fondo" value={design.background_color ?? "#FBF7F1"} onChange={(v) => updateDesign("background_color", v)} />
              <ColorField label="Texto" value={design.text_color ?? "#332B27"} onChange={(v) => updateDesign("text_color", v)} />
            </div>
            <p className="mt-3 text-xs text-[#8A8074]">Este es el primer diseño funcional. La selección de plantillas y las personalizaciones avanzadas se ampliarán en siguientes iteraciones.</p>
          </section>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#E7DCC8] pt-6">
            <button type="button" disabled={saving} onClick={() => void saveInvitation("draft")} className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC8] bg-white px-5 py-3 text-sm font-medium text-[#5C554B] disabled:opacity-50">
              <Save size={16} /> Guardar borrador
            </button>
            <button type="button" disabled={saving} onClick={() => void saveInvitation("published")} className="rounded-full bg-[#A88249] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? "Guardando..." : "Publicar invitación"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm font-medium text-[#4E463D]">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={500} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]" />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-[#4E463D]">
      {label}
      <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-[#E7DCC8] bg-white p-2">
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#9A7358"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer border-0 bg-transparent" />
        <span className="text-sm text-[#7D7467]">{value}</span>
      </div>
    </label>
  );
}
