"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ExternalLink, ImagePlus, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { uploadCover } from "@/lib/events";
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
  host_names: "",
  introduction: "Nos encantará compartir este día contigo.",
  ceremony_time: "",
  ceremony_venue: "",
  ceremony_address: "",
  dress_code: "",
  rsvp_deadline: "",
});

const emptyDesign: InvitationDesign = {
  accent_color: "#9A7358",
  background_color: "#FBF7F1",
  text_color: "#332B27",
};

export default function InvitationEditor({ event, organizerToken }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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

  async function handleCoverUpload(eventFile: ChangeEvent<HTMLInputElement>) {
    const file = eventFile.target.files?.[0];
    eventFile.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 10 MB.");
      return;
    }
    setUploadingCover(true);
    try {
      const url = await uploadCover(file, event.id);
      updateDesign("cover_image_url", url);
      toast.success("Portada cargada. Guarda los cambios para aplicarla.");
    } catch (error) {
      console.error("Error cargando portada de invitación:", error);
      toast.error("No fue posible subir la portada.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function saveInvitation(nextStatus = status) {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("save_invitation_with_token", {
        p_event_id: event.id,
        p_organizer_token: organizerToken,
        p_slug: event.slug,
        p_template_key: "editorial",
        p_design_config: design,
        p_content_config: content,
        p_rsvp_enabled: rsvpEnabled,
        p_max_party_size: maxPartySize,
        p_status: nextStatus,
      });
      if (error) throw error;
      if (!data?.length) throw new Error("No se recibió confirmación del guardado.");
      setStatus(nextStatus);
      toast.success(nextStatus === "published" ? "Invitación publicada." : "Cambios guardados.");
    } catch (error) {
      console.error("Error guardando invitación:", error);
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la invitación.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]";
  const labelClass = "block text-sm font-medium text-[#4E463D]";
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7DCC8] px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F0E6D8] text-[#8E6D3D]"><Sparkles size={19} /></span>
          <div>
            <h2 className="text-xl font-semibold text-[#1F1F1F]">Invitación digital</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#7D7467]">Prepara una invitación bonita y comparte todos los detalles de tu celebración.</p>
            <p className="mt-2 text-xs text-[#8A8074]">Enlace: <span className="font-medium text-[#5C554B]">/i/{event.slug}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={status === "published" ? "rounded-full bg-[#EEF6F0] px-3 py-1.5 text-xs font-medium text-[#37724A]" : "rounded-full bg-[#FFF4DD] px-3 py-1.5 text-xs font-medium text-[#936A25]"}>
            {status === "published" ? "Publicada" : "Borrador"}
          </span>
          {status === "published" && <a href={`/i/${encodeURIComponent(event.slug)}`} target="_blank" rel="noreferrer" aria-label="Ver invitación publicada" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DCC8] bg-white text-[#5C554B] hover:bg-[#F7F3EC]"><ExternalLink size={15} /></a>}
        </div>
      </header>

      {!loaded ? (
        <p className="px-6 py-8 text-sm text-[#7D7467]">Cargando invitación...</p>
      ) : (
        <div className="space-y-7 p-5 sm:p-7">
          <section>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#332B27]">Portada</h3>
              <p className="mt-1 text-sm text-[#7D7467]">Elige una imagen que marque el estilo de tu invitación. Es independiente de la portada de la galería.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white">
                {cover ? (
                  <div className="h-56 w-full bg-cover bg-center sm:h-full sm:min-h-56" style={{ backgroundImage: `url("${cover.replace(/["\\\\]/g, "")}")` }} role="img" aria-label="Portada de la invitación" />
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top_right,#EAD9C5,transparent_55%),linear-gradient(135deg,#FBF7F1,#FFFFFF)] p-6 text-center text-[#7D7467]">
                    <ImagePlus size={28} strokeWidth={1.5} />
                    <span className="text-sm">Todavía no has elegido una portada</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-dashed border-[#D9CBB6] bg-white p-5">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={uploadingCover} onChange={handleCoverUpload} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingCover} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#A88249] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8E6D3D] disabled:cursor-not-allowed disabled:opacity-60">
                  <ImagePlus size={17} /> {uploadingCover ? "Subiendo imagen..." : cover ? "Cambiar portada" : "Subir portada"}
                </button>
                {cover && <button type="button" onClick={() => updateDesign("cover_image_url", "")} className="mt-2 rounded-full px-3 py-2 text-sm text-[#7D7467] hover:bg-[#F7F3EC]">Quitar portada</button>}
                <p className="mt-3 text-xs leading-5 text-[#8A8074]">JPG, PNG o WebP · máximo 10 MB. Recuerda guardar los cambios después de subirla.</p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Mensaje de invitación</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título principal" value={content.headline ?? ""} onChange={(v) => updateContent("headline", v)} placeholder={event.title} />
              <Field label="Nombres de quienes invitan" value={content.host_names ?? ""} onChange={(v) => updateContent("host_names", v)} placeholder="Ej. Sofía y Alejandro" />
              <div className="sm:col-span-2">
                <label className={labelClass}>Mensaje breve</label>
                <textarea rows={3} value={content.introduction ?? ""} onChange={(e) => updateContent("introduction", e.target.value)} placeholder="Nos encantará compartir este día contigo." maxLength={500} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-1 text-base font-semibold text-[#332B27]">Detalles del evento</h3>
            <p className="mb-4 text-sm text-[#7D7467]">La fecha se toma de la configuración general del evento.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hora" value={content.ceremony_time ?? ""} onChange={(v) => updateContent("ceremony_time", v)} placeholder="Ej. 17:00 h" />
              <Field label="Lugar" value={content.ceremony_venue ?? ""} onChange={(v) => updateContent("ceremony_venue", v)} placeholder="Nombre del salón o recinto" />
              <div className="sm:col-span-2">
                <Field label="Dirección" value={content.ceremony_address ?? ""} onChange={(v) => updateContent("ceremony_address", v)} placeholder="Calle, número, ciudad" />
              </div>
              <Field label="Código de vestimenta (opcional)" value={content.dress_code ?? ""} onChange={(v) => updateContent("dress_code", v)} placeholder="Ej. Formal" />
              <Field label="Fecha límite para confirmar (opcional)" value={content.rsvp_deadline ?? ""} onChange={(v) => updateContent("rsvp_deadline", v)} placeholder="Ej. 10 de noviembre" />
            </div>
          </section>

          <section className="border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Confirmación de asistencia</h3>
            <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-[#4E463D]">Permitir confirmar asistencia</span>
                  <span className="mt-1 block text-xs text-[#8A8074]">Los invitados podrán responder desde la invitación.</span>
                </span>
                <input type="checkbox" checked={rsvpEnabled} onChange={(e) => setRsvpEnabled(e.target.checked)} className="h-5 w-5 accent-[#A88249]" />
              </label>
              {rsvpEnabled && <label className="flex flex-wrap items-center gap-3 border-t border-[#F0E9DF] pt-4 text-sm text-[#4E463D]">
                Máximo de personas por confirmación
                <select value={maxPartySize} onChange={(e) => setMaxPartySize(Number(e.target.value))} className="rounded-lg border border-[#E7DCC8] bg-white px-3 py-2">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>)}
                </select>
              </label>}
            </div>
          </section>

          <details className="border-t border-[#E7DCC8] pt-6">
            <summary className="cursor-pointer text-sm font-semibold text-[#5C554B]">Personalizar colores</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <ColorField label="Acento" value={design.accent_color ?? "#9A7358"} onChange={(v) => updateDesign("accent_color", v)} />
              <ColorField label="Fondo" value={design.background_color ?? "#FBF7F1"} onChange={(v) => updateDesign("background_color", v)} />
              <ColorField label="Texto" value={design.text_color ?? "#332B27"} onChange={(v) => updateDesign("text_color", v)} />
            </div>
          </details>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#E7DCC8] pt-6">
            <button type="button" disabled={saving || uploadingCover} onClick={() => void saveInvitation("draft")} className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC8] bg-white px-5 py-3 text-sm font-medium text-[#5C554B] disabled:opacity-50">
              <Save size={16} /> Guardar cambios
            </button>
            <button type="button" disabled={saving || uploadingCover} onClick={() => void saveInvitation("published")} className="rounded-full bg-[#A88249] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? "Guardando..." : status === "published" ? "Guardar y publicar" : "Publicar invitación"}
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
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={300} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]" />
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
