"use client";

import { ChangeEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { Copy, ExternalLink, ImagePlus, RotateCcw, Save, Sparkles, Users, Mail, Mails, Gift, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { uploadCover } from "@/lib/events";
import type { Event } from "@/types/event";
import type { InvitationContent, InvitationDesign, InvitationStatus, InvitationTemplateKey } from "@/types/invitation";
import { INVITATION_PALETTES, INVITATION_TEMPLATE_OPTIONS } from "@/lib/invitation-palettes";

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

const isIsoDate = (value?: string) => Boolean(value && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value));

function defaultEventLabel(template: TemplateKey): string {
  if (["xv_gala", "velvet_royale", "celestial_etoile", "coquette_couture"].includes(template)) return "Mis XV";
  if (["baby_soft", "little_wildflower"].includes(template)) return "Mi Baby";
  if (["baptism_light", "luz_de_cielo"].includes(template)) return "Mi Bautizo";
  if (template === "two_little_secrets") return "Revelación";
  if (template === "studio_party") return "Mi celebración";
  if (["maison_botanique", "noir_champagne"].includes(template)) return "Nuestra boda";
  return "Mi celebración";
}

const emptyContent = (event: Event): InvitationContent => ({
  event_label: defaultEventLabel(defaultTemplate(event)),
  headline: event.title,
  host_names: "",
  introduction: "Nos encantará compartir este día contigo.",
  intro_headline: "",
  ceremony_time: "",
  ceremony_venue: "",
  ceremony_address: "",
  reception_title: "Recepción",
  religious_ceremony_enabled: false,
  religious_ceremony_time: "",
  religious_ceremony_venue: "",
  religious_ceremony_address: "",
  dress_code: "",
  rsvp_deadline: "",
});


type TemplateKey = InvitationTemplateKey;
const TEMPLATE_OPTIONS = INVITATION_TEMPLATE_OPTIONS.map((option) => ({ ...option, palette: INVITATION_PALETTES[option.key] }));
function isKnownTemplateKey(value: string): value is TemplateKey {
  return Object.prototype.hasOwnProperty.call(INVITATION_PALETTES, value);
}

function initialDesignForTemplate(template: TemplateKey): InvitationDesign {
  return { ...INVITATION_PALETTES[template], art_direction_version: 2 };
}

// Asigna una plantilla inicial coherente con el tipo de evento; todas pueden cambiarse desde el editor.
function defaultTemplate(event: Event): TemplateKey {
  const type = String(event.type ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (type.includes("xv") || type.includes("quince")) return "velvet_royale";
  if (type.includes("reveal") || type.includes("gender") || type.includes("revelacion")) return "two_little_secrets";
  if (type.includes("baby")) return "little_wildflower";
  if (type.includes("bapt") || type.includes("baut")) return "luz_de_cielo";
  if (type.includes("birthday") || type.includes("cumple")) return "studio_party";
  if (type.includes("wedding") || type.includes("boda")) return "wedding_editorial";
  return "studio_party";
}

function initialDesign(event: Event): InvitationDesign {
  return { ...INVITATION_PALETTES[defaultTemplate(event)] };
}

export default function InvitationEditor({ event, organizerToken }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingWaxSeal, setUploadingWaxSeal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const waxSealFileRef = useRef<HTMLInputElement>(null);
  const colorsSectionRef = useRef<HTMLDetailsElement>(null);
  const [content, setContent] = useState<InvitationContent>(() => emptyContent(event));
  const [design, setDesign] = useState<InvitationDesign>(() => initialDesign(event));
  const [templateKey, setTemplateKey] = useState<TemplateKey>(() => defaultTemplate(event));
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [maxPartySize, setMaxPartySize] = useState(2);
  const [status, setStatus] = useState<InvitationStatus>("draft");
  const [copiedOrganizerLink, setCopiedOrganizerLink] = useState(false);
  const [contrastView, setContrastView] = useState<"general" | "cards" | "buttons" | "confirmation">("general");

  useEffect(() => {
    let active = true;
    async function loadInvitation() {
      const { data, error } = await supabase.rpc("get_invitation_for_organizer", {
        p_event_id: event.id,
        p_organizer_token: organizerToken,
      });
      if (!active) return;
      if (error) {
        console.error("Error cargando invitación:", error);
        setLoadError(true);
        toast.error("No pudimos cargar tu invitación. Puedes intentarlo de nuevo.");
        setLoaded(true);
        return;
      }
      setLoadError(false);
      const row = (data?.[0] as InvitationRow | undefined) ?? null;
      if (row) {
        const rowTemplate = isKnownTemplateKey(row.template_key) ? row.template_key : defaultTemplate(event);
        setContent({ ...emptyContent(event), ...(row.content_config ?? {}), confirmation_mode: row.content_config?.confirmation_mode ?? (row.rsvp_enabled ? "rsvp" : "none"), event_label: row.content_config?.event_label ?? defaultEventLabel(rowTemplate) });
        setDesign({ ...INVITATION_PALETTES[rowTemplate], ...(row.design_config ?? {}) });
        setTemplateKey(rowTemplate);
        setRsvpEnabled(row.rsvp_enabled);
        setMaxPartySize(row.max_party_size);
        setStatus(row.status);
      }
      setLoaded(true);
    }
    void loadInvitation();
    return () => { active = false; };
  }, [event, organizerToken, loadAttempt]);

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
    const allowedCoverTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedCoverTypes.includes(file.type)) {
      toast.error("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 10 MB.");
      return;
    }
    setUploadingCover(true);
    try {
      const url = await uploadCover(file, event.id, organizerToken);
      updateDesign("cover_image_url", url);
      toast.success("Portada cargada. Guarda los cambios para aplicarla.");
    } catch (error) {
      console.error("Error cargando portada de invitación:", error);
      toast.error("No fue posible subir la portada.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleWaxSealUpload(eventFile: ChangeEvent<HTMLInputElement>) {
    const file = eventFile.target.files?.[0];
    eventFile.target.value = "";
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 10 MB.");
      return;
    }
    setUploadingWaxSeal(true);
    try {
      const url = await uploadCover(file, event.id, organizerToken);
      updateDesign("wax_seal_image_url", url);
      toast.success("Distintivo cargado. Guarda los cambios para aplicarlo.");
    } catch (error) {
      console.error("Error cargando distintivo:", error);
      toast.error("No fue posible subir el distintivo.");
    } finally {
      setUploadingWaxSeal(false);
    }
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
        p_rsvp_enabled: (content.confirmation_mode ?? (rsvpEnabled ? "rsvp" : "none")) === "rsvp",
        p_max_party_size: maxPartySize,
        p_status: nextStatus,
      });
      if (error) throw error;
      if (!data?.length) throw new Error("No se recibió confirmación del guardado.");
      setStatus(nextStatus);
      toast.success(nextStatus === "published" ? "Invitación publicada." : "Cambios guardados.");
    } catch (error) {
      console.error("Error guardando invitación:", error);
      toast.error(nextStatus === "published" ? "No pudimos publicar la invitación. Revisa tu conexión e inténtalo de nuevo." : "No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function copyOrganizerLink() {
    const url = `${window.location.origin}/rsvp/${encodeURIComponent(organizerToken)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedOrganizerLink(true);
      window.setTimeout(() => setCopiedOrganizerLink(false), 2200);
      toast.success("Enlace de confirmaciones copiado.");
    } catch {
      toast.error("No fue posible copiar el enlace. Puedes copiarlo desde la dirección del navegador.");
    }
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]";
  const labelClass = "block text-sm font-medium text-[#4E463D]";
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;

  return (
    <section id="invitation" className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7DCC8] px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F0E6D8] text-[#8E6D3D]"><Sparkles size={19} /></span>
          <div>
            <h2 className="text-xl font-semibold text-[#1F1F1F]">Invitación digital</h2>
            <p className="mt-1 text-sm text-[#7D7467]">Edita los datos y publica la invitación.</p>
            <p className="mt-2 text-xs text-[#8A8074]">Invitación: <span className="font-medium text-[#5C554B]">/i/{event.slug}</span></p>
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
        <p className="px-6 py-8 text-sm text-[#7D7467]" role="status">Cargando invitación...</p>
      ) : loadError ? (
        <div role="alert" className="m-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center sm:m-7">
          <p className="font-semibold text-red-900">No pudimos cargar tu invitación</p>
          <p className="mt-2 text-sm leading-6 text-red-800">Tus datos no se han modificado. Comprueba tu conexión y vuelve a intentarlo antes de hacer cambios.</p>
          <button type="button" onClick={() => { setLoaded(false); setLoadError(false); setLoadAttempt((attempt) => attempt + 1); }} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-900 transition hover:bg-red-100">Volver a intentar</button>
        </div>
      ) : (
        <div className="space-y-7 p-5 sm:p-7">
          <nav aria-label="Ir a una sección del editor" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            {[
              ["editor-cover", "Portada"],
              ["editor-design", "Diseño"],
              ["editor-message", "Mensaje"],
              ["editor-event", "Evento"],
              ["editor-gifts", "Regalos"],
              ["editor-ceremony", "Ceremonia"],
              ["editor-rsvp", "Confirmación"],
              ["editor-colors", "Colores"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => { if (id === "editor-colors") colorsSectionRef.current?.setAttribute("open", ""); }} className="shrink-0 rounded-full border border-[#D9C7AA] bg-white px-3.5 py-2 text-xs font-semibold text-[#51483E] transition hover:border-[#A88249] hover:bg-[#FBF5E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88249]">
                {label}
              </a>
            ))}
          </nav>
          <section className="rounded-2xl border border-[#E7DCC8] bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[#332B27]">Confirmaciones del organizador</h3>
            <p className="mt-1 text-sm text-[#7D7467]">Comparte este enlace con la persona que organizará el evento.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={copyOrganizerLink} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#332B27] px-4 py-2 text-sm font-medium text-white hover:bg-[#51443A]"><Copy size={15} />{copiedOrganizerLink ? "Enlace copiado" : "Copiar enlace privado"}</button>
              <a href={`/rsvp/${encodeURIComponent(organizerToken)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm font-medium text-[#5C554B] hover:bg-[#F7F3EC]"><Users size={15} />Ver confirmaciones</a>
            </div>
          </section>
          <section id="editor-cover" className="scroll-mt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#332B27]">Portada</h3>
              <p className="mt-1 text-sm text-[#7D7467]">Sube la imagen principal de la invitación.</p>
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
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingCover} onChange={handleCoverUpload} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingCover} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#A88249] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8E6D3D] disabled:cursor-not-allowed disabled:opacity-60">
                  <ImagePlus size={17} /> {uploadingCover ? "Subiendo imagen..." : cover ? "Cambiar portada" : "Subir portada"}
                </button>
                {cover && <button type="button" onClick={() => updateDesign("cover_image_url", "")} className="mt-2 rounded-full px-3 py-2 text-sm text-[#7D7467] hover:bg-[#F7F3EC]">Quitar portada</button>}
                <p className="mt-3 text-xs leading-5 text-[#8A8074]">JPG, PNG o WebP · máximo 10 MB. Recuerda guardar los cambios después de subirla.</p>
              </div>
            </div>
            {(["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"] as TemplateKey[]).includes(templateKey) && (
              <div className="mt-6 rounded-2xl border border-[#E7DCC8] bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#332B27]">{templateKey === "wedding_editorial" ? "Sello de cera de los novios" : templateKey === "xv_gala" ? "Distintivo de XV años" : templateKey === "baby_soft" ? "Distintivo de baby shower" : "Distintivo de bautizo"}</h4>
                  <p className="mt-1 text-sm leading-5 text-[#7D7467]">Opcional. Sube una imagen decorativa para reemplazar la línea debajo de la portada. Si no hay imagen, se conserva la línea original.</p>
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {design.wax_seal_image_url?.startsWith("https://") ? (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[#EEE5D8] bg-[#FBF7F1] p-2">
                      <img src={design.wax_seal_image_url} alt="Vista previa del distintivo decorativo" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#D9CBB6] bg-[#FBF7F1] text-center text-xs text-[#8A8074]">Sin imagen</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <input ref={waxSealFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingWaxSeal} onChange={handleWaxSealUpload} />
                    <button type="button" onClick={() => waxSealFileRef.current?.click()} disabled={uploadingWaxSeal} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#A88249] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8E6D3D] disabled:cursor-not-allowed disabled:opacity-60">
                      <ImagePlus size={16} /> {uploadingWaxSeal ? "Subiendo imagen..." : design.wax_seal_image_url ? "Cambiar imagen" : "Subir imagen"}
                    </button>
                    {design.wax_seal_image_url && <button type="button" onClick={() => updateDesign("wax_seal_image_url", "")} className="inline-flex min-h-10 items-center justify-center rounded-full px-3 py-2.5 text-sm text-[#7D7467] hover:bg-[#F7F3EC]">Quitar imagen</button>}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#8A8074]">JPG, PNG o WebP · máximo 10 MB. Si no hay imagen, se conserva la línea original.</p>
              </div>
            )}
          </section>

          <section id="editor-design" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#332B27]">Diseño de la invitación</h3>
              <p className="mt-1 text-sm leading-6 text-[#6F665B]">Elige el estilo que mejor acompaña tu celebración. Puedes personalizar sus colores después.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {TEMPLATE_OPTIONS.map((option) => {
                const selected = templateKey === option.key;
                const palette = option.palette;
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      if (selected) return;
                      setTemplateKey(option.key);
                      setContent((current) => ({
                        ...current,
                        event_label: !current.event_label || ["Boda", "Mis XV", "Mi Baby", "Mi Bautizo"].includes(current.event_label)
                          ? defaultEventLabel(option.key)
                          : current.event_label,
                      }));
                      setDesign((current) => ({ ...initialDesignForTemplate(option.key), cover_image_url: current.cover_image_url, wax_seal_image_url: current.wax_seal_image_url }));
                    }}
                    className={`group relative min-w-0 overflow-hidden rounded-2xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${selected ? "shadow-sm ring-1" : "border-[#E7DCC8] bg-white hover:border-[#C5AD88]"}`}
                    style={{ outlineColor: palette.accent_color, borderColor: selected ? palette.border_color : undefined, backgroundColor: selected ? "#FFFFFF" : undefined }}
                  >
                    <div className="mb-3 overflow-hidden rounded-xl border shadow-sm" style={{ backgroundColor: palette.background_color, borderColor: palette.border_color }}>
                      <div className="relative flex h-12 items-end overflow-hidden px-3 pb-2" style={{ background: `linear-gradient(135deg, ${palette.title_color} 0%, ${palette.card_background_color} 100%)` }}>
                        <span className="absolute inset-1.5 border opacity-50" style={{ borderColor: palette.border_color }} />
                        <span className="relative block h-1.5 w-2/3 rounded-full" style={{ backgroundColor: palette.card_text_color }} />
                      </div>
                      <div className="space-y-2 px-3 py-2.5">
                        <span className="mx-auto block h-1 w-6 rounded-full" style={{ backgroundColor: palette.accent_color }} />
                        <span className="mx-auto block h-1.5 w-3/4 rounded-full" style={{ backgroundColor: palette.title_color }} />
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <span className="h-5 rounded-md border" style={{ backgroundColor: palette.card_background_color, borderColor: palette.border_color }} />
                          <span className="h-5 rounded-md border" style={{ backgroundColor: palette.card_background_color, borderColor: palette.border_color }} />
                        </div>
                        <span className="mx-auto block h-2 w-1/2 rounded-full" style={{ backgroundColor: palette.button_color }} />
                      </div>
                    </div>
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-5 text-[#332B27]">{option.label}</span>
                        <span className="mt-1.5 block text-sm leading-5 text-[#51483E]">{option.description}</span>
                      </span>
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "text-white" : "border-[#D6C9B7] bg-white text-transparent"}`}
                      style={selected ? { borderColor: palette.button_color, backgroundColor: palette.button_color } : undefined} aria-hidden="true">
                        <span className="text-xs leading-none">✓</span>
                      </span>
                    </span>
                    <span className="mt-3 flex items-center gap-1.5" aria-label="Colores de la plantilla">
                      {[palette.background_color, palette.title_color, palette.accent_color, palette.button_color, palette.border_color].map((color, index) => (
                        <span key={`${option.key}-${index}`} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    {selected && <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: palette.accent_color }}>Plantilla seleccionada</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#62594F]">Al elegir una plantilla activa se aplica su paleta inicial. Tu portada se conserva; los demás colores se pueden ajustar en «Personalizar colores».</p>
            {design.art_direction_version !== 2 && TEMPLATE_OPTIONS.some((option) => option.key === templateKey) && (
              <div className="mt-4 rounded-2xl border border-[#D8C39B] bg-[#FBF7EF] p-4">
                <p className="text-sm font-semibold text-[#51412F]">Esta invitación conserva su diseño original.</p>
                <p className="mt-1 text-sm leading-5 text-[#6F6252]">Si deseas aplicar la versión actual de «{TEMPLATE_OPTIONS.find((option) => option.key === templateKey)?.label}», puedes actualizarla aquí. Se conservarán la portada, el distintivo y el contenido del evento.</p>
                <button
                  type="button"
                  onClick={() => setDesign((current) => ({
                    ...initialDesignForTemplate(templateKey),
                    cover_image_url: current.cover_image_url,
                    wax_seal_image_url: current.wax_seal_image_url,
                  }))}
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#51412F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#392D22]"
                >
                  Actualizar al diseño actual
                </button>
              </div>
            )}
          </section>

          <section id="editor-message" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Mensaje de invitación</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del evento (etiqueta superior)" value={content.event_label ?? ""} onChange={(v) => updateContent("event_label", v)} placeholder={defaultEventLabel(templateKey)} maxLength={60} />
              <Field label="Título principal" value={content.headline ?? ""} onChange={(v) => updateContent("headline", v)} placeholder={event.title} />
              <Field label="Nombres de quienes invitan" value={content.host_names ?? ""} onChange={(v) => updateContent("host_names", v)} placeholder="Ej. Sofía y Alejandro" />
              <div className="sm:col-span-2 rounded-2xl border border-[#E7DCC8] bg-white p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#4E463D]">
                  <input type="checkbox" checked={content.godparents_enabled ?? false} onChange={(e) => updateContent("godparents_enabled", e.target.checked)} className="h-4 w-4 accent-[#A88249]" />
                  Mostrar sección de padrinos
                </label>
                {content.godparents_enabled && (
                  <div className="mt-4 space-y-4">
                    <Field label="Título de la sección" value={content.godparents_heading ?? "Nuestros padrinos"} onChange={(v) => updateContent("godparents_heading", v)} placeholder="Ej. Nuestros padrinos" maxLength={60} />
                    {(content.godparents ?? []).map((godparent, index) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-[#EEE5D8] p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end">
                        <div>
                          <label className={labelClass}>Título / parentesco</label>
                          <input value={godparent.role} onChange={(e) => updateContent("godparents", (content.godparents ?? []).map((item, i) => i === index ? { ...item, role: e.target.value } : item))} placeholder="Ej. Madrina" maxLength={40} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Nombre</label>
                          <input value={godparent.name} onChange={(e) => updateContent("godparents", (content.godparents ?? []).map((item, i) => i === index ? { ...item, name: e.target.value } : item))} placeholder="Nombre del padrino o madrina" maxLength={100} className={inputClass} />
                        </div>
                        <button type="button" onClick={() => updateContent("godparents", (content.godparents ?? []).filter((_, i) => i !== index))} className="min-h-10 rounded-full border border-[#E7DCC8] px-3 text-xs font-medium text-[#7D7467] hover:bg-[#F7F3EC]">Eliminar</button>
                      </div>
                    ))}
                    <button type="button" disabled={(content.godparents ?? []).length >= 8} onClick={() => updateContent("godparents", [...(content.godparents ?? []), { role: "", name: "" }])} className="rounded-full border border-[#D8C5A5] px-4 py-2.5 text-sm font-medium text-[#795D35] disabled:opacity-40">Agregar padrino o madrina</button>
                    <p className="text-xs leading-5 text-[#8A8074]">Puedes agregar hasta 8 personas. Solo se mostrarán los registros que tengan nombre.</p>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Título de introducción <span className="font-normal text-[#8A8074]">(opcional)</span></label>
                <input type="text" value={content.intro_headline ?? ""} onChange={(e) => updateContent("intro_headline", e.target.value)} placeholder="Déjalo vacío si no deseas mostrar un título" maxLength={80} className={inputClass} />
                <p className="mt-1 text-xs text-[#8A8074]">Si lo dejas vacío, no se mostrará ningún título y la composición se ajustará automáticamente.</p>
                <p className="text-right text-xs text-[#8A8074]">{(content.intro_headline ?? "").length}/80 caracteres</p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Mensaje breve</label>
                <textarea rows={3} value={content.introduction ?? ""} onChange={(e) => updateContent("introduction", e.target.value)} placeholder="Nos encantará compartir este día contigo." maxLength={240} className={inputClass} />
                <p className="mt-1 text-right text-xs text-[#8A8074]">{(content.introduction ?? "").length}/240 caracteres</p>
              </div>
            </div>
          </section>

          <section id="editor-event" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-1 text-base font-semibold text-[#332B27]">Detalles del evento</h3>
            <p className="mb-4 text-sm text-[#7D7467]">La fecha se toma de la configuración general del evento.</p>
            <div className="mb-4 max-w-xl"><Field label="Título de la tarjeta de recepción" value={content.reception_title ?? ""} onChange={(v) => updateContent("reception_title", v)} placeholder="Recepción" maxLength={40} /><p className="mt-1 text-xs text-[#8A8074]">Si lo dejas vacío, se mostrará “Recepción”.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hora de recepción" type="time" value={content.ceremony_time ?? ""} onChange={(v) => updateContent("ceremony_time", v)} />
              <Field label="Lugar de recepción" value={content.ceremony_venue ?? ""} onChange={(v) => updateContent("ceremony_venue", v)} placeholder="Nombre del salón o recinto" />
              <div className="sm:col-span-2">
                <Field label="Dirección" value={content.ceremony_address ?? ""} onChange={(v) => updateContent("ceremony_address", v)} placeholder="Calle, número, ciudad" />
              </div>
              <Field label="Código de vestimenta (opcional)" value={content.dress_code ?? ""} onChange={(v) => updateContent("dress_code", v)} placeholder="Ej. Formal" />
              <label className={labelClass}>
                Fecha límite para confirmar (opcional)
                <input type="date" value={isIsoDate(content.rsvp_deadline) ? content.rsvp_deadline : ""} onChange={(e) => updateContent("rsvp_deadline", e.target.value)} className={inputClass} />
                <span className="mt-1 block text-xs font-normal text-[#8A8074]">Se aceptan confirmaciones hasta el final de ese día, hora de Monterrey.</span>
                {content.rsvp_deadline && !isIsoDate(content.rsvp_deadline) && <span className="mt-1 block text-xs font-normal text-[#8A8074]">Fecha anterior guardada: {content.rsvp_deadline}. Selecciona una fecha nueva para cambiarla.</span>}
              </label>
            </div>
          </section>

          <section id="editor-gifts" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-1 text-base font-semibold text-[#332B27]">Sugerencias de regalo (opcional)</h3>
            <p className="mb-4 text-sm leading-6 text-[#7D7467]">Esta tarjeta aparecerá en la invitación cuando agregues al menos un mensaje, tipo de regalo o enlace a una mesa de regalos.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Mensaje para los invitados
                  <textarea rows={3} value={content.gift_message ?? ""} onChange={(e) => updateContent("gift_message", e.target.value)} placeholder="Ej. Su presencia es nuestro mejor regalo, pero si desean tener un detalle con nosotros..." maxLength={300} className={inputClass} />
                </label>
                <p className="mt-1 text-right text-xs text-[#8A8074]">{(content.gift_message ?? "").length}/300 caracteres</p>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-[#4E463D]">Icono de regalo</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {([
                    { value: "envelope", label: "Sobre", Icon: Mail },
                    { value: "gift", label: "Regalo", Icon: Gift },
                    { value: "envelopes", label: "Lluvia de sobres", Icon: Mails },
                    { value: "heart", label: "Detalle especial", Icon: Heart },
                  ] as const).map(({ value, label, Icon }) => {
                    const selected = (content.gift_icon ?? "gift") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateContent("gift_icon", value)}
                        aria-pressed={selected}
                        className={`flex min-h-16 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${selected ? "border-[#A88249] bg-[#F8F2E8] text-[#6F5635] ring-1 ring-[#A88249]/30" : "border-[#E7DCC8] bg-white text-[#6D655B] hover:border-[#C5AD88]"}`}
                      >
                        <Icon size={19} strokeWidth={1.7} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-[#8A8074]">Elige el símbolo que acompañará las sugerencias de regalo.</p>
              </div>
              <Field label="Preferencia de regalo (opcional)" value={content.gift_type ?? ""} onChange={(v) => updateContent("gift_type", v)} placeholder="Ej. Sobre, regalo en efectivo o algún detalle" maxLength={120} />
              <Field label="Texto del botón (opcional)" value={content.gift_registry_label ?? ""} onChange={(v) => updateContent("gift_registry_label", v)} placeholder="Ej. Ver mesa de regalos" maxLength={50} />
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  URL de la mesa de regalos (opcional)
                  <input type="url" value={content.gift_registry_url ?? ""} onChange={(e) => updateContent("gift_registry_url", e.target.value)} placeholder="https://..." maxLength={1000} className={inputClass} />
                </label>
                <p className="mt-1 text-xs leading-5 text-[#8A8074]">Pega el enlace completo de la tienda. El botón solo aparecerá si la URL es válida y usa http o https.</p>
              </div>
            </div>
          </section>

          <section id="editor-ceremony" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#332B27]">Ceremonia (opcional)</h3>
                <p className="mt-1 text-sm text-[#7D7467]">Agrega una tarjeta independiente para iglesia, templo u otra ceremonia. No sustituye los datos de la celebración principal.</p>
              </div>
              <input aria-label="Mostrar ceremonia" type="checkbox" checked={Boolean(content.religious_ceremony_enabled)} onChange={(e) => updateContent("religious_ceremony_enabled", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#A88249]" />
            </div>
            {content.religious_ceremony_enabled && <div className="mt-4 grid gap-4 rounded-2xl bg-white p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Hora de la ceremonia" type="time" value={content.religious_ceremony_time ?? ""} onChange={(v) => updateContent("religious_ceremony_time", v)} />
              <Field label="Iglesia o recinto" value={content.religious_ceremony_venue ?? ""} onChange={(v) => updateContent("religious_ceremony_venue", v)} placeholder="Nombre de la iglesia o recinto" />
              <div className="sm:col-span-2"><Field label="Dirección de la ceremonia" value={content.religious_ceremony_address ?? ""} onChange={(v) => updateContent("religious_ceremony_address", v)} placeholder="Calle, número, ciudad" /></div>
            </div>}
          </section>

          <section id="editor-rsvp" className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <h3 className="mb-4 text-base font-semibold text-[#332B27]">Confirmación de asistencia</h3>
            <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5">
              <label className={labelClass}>
                Tipo de confirmación
                <select value={content.confirmation_mode ?? (rsvpEnabled ? "rsvp" : "none")} onChange={(e) => { const mode = e.target.value as "rsvp" | "whatsapp" | "none"; updateContent("confirmation_mode", mode); setRsvpEnabled(mode === "rsvp"); }} className={inputClass}>
                  <option value="rsvp">RSVP con registro y panel de respuestas</option>
                  <option value="whatsapp">Formulario con confirmación por WhatsApp (básica)</option>
                  <option value="none">Sin confirmación de asistencia</option>
                </select>
              </label>
              {content.confirmation_mode === "whatsapp" && <div>
                <label className={labelClass}>
                  Número de WhatsApp que recibirá las confirmaciones
                  <input type="tel" inputMode="tel" autoComplete="tel" value={content.whatsapp_confirmation_phone ?? ""} onChange={(e) => updateContent("whatsapp_confirmation_phone", e.target.value)} placeholder="Ej. 528112345678" maxLength={20} className={inputClass} />
                </label>
                <p className="mt-1 text-xs leading-5 text-[#8A8074]">Incluye el código de país (por ejemplo, 52 para México). Al confirmar, WhatsApp abrirá un mensaje listo para enviar; no se guardará en el panel RSVP.</p>
              </div>}
              {(content.confirmation_mode === "rsvp" || content.confirmation_mode === "whatsapp") && <label className="flex flex-wrap items-center gap-3 border-t border-[#F0E9DF] pt-4 text-sm text-[#4E463D]">
                Máximo de personas por confirmación
                <select value={maxPartySize} onChange={(e) => setMaxPartySize(Number(e.target.value))} className="rounded-lg border border-[#E7DCC8] bg-white px-3 py-2">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>)}
                </select>
              </label>}
            </div>
          </section>

          <details id="editor-colors" ref={colorsSectionRef} className="scroll-mt-6 border-t border-[#E7DCC8] pt-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-4 text-sm font-semibold text-[#332B27] shadow-sm transition hover:bg-[#FBF7F0] [&::-webkit-details-marker]:hidden" style={{ borderColor: design.border_color ?? INVITATION_PALETTES[templateKey].border_color ?? "#D9D8D1" }}>
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: design.border_color ?? INVITATION_PALETTES[templateKey].border_color ?? "#D9D8D1", backgroundColor: design.rsvp_background_color ?? INVITATION_PALETTES[templateKey].rsvp_background_color ?? "#EAE7DF", color: design.accent_color ?? INVITATION_PALETTES[templateKey].accent_color ?? "#344B61" }}><Sparkles size={18} /></span>
                <span><span className="block">Personalizar colores</span><span className="mt-1 block text-xs font-normal text-[#62594F]">Ajusta el contraste y la personalidad de cada sección.</span></span>
              </span>
              <span className="text-xs font-semibold" style={{ color: design.accent_color ?? INVITATION_PALETTES[templateKey].accent_color ?? "#344B61" }}>Editar ↓</span>
            </summary>
            <div className="mt-4 rounded-2xl border border-[#E7DCC8] bg-white p-4 sm:p-5">
              <p className="mb-5 text-sm leading-6 text-[#51483E]">Los cambios se guardan al pulsar «Guardar cambios» o «Guardar y publicar». Para facilitar la lectura, procura que el texto contraste claramente con su fondo.</p>
              <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="min-w-0 rounded-xl border border-[#D9C7AA] bg-[#FBF7F0] p-3 sm:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62594F]">Vista de contraste</p>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Seleccionar vista de contraste">
                    {([
                      ["general", "General"],
                      ["cards", "Tarjetas"],
                      ["buttons", "Botones"],
                      ["confirmation", "Confirmación"],
                    ] as const).map(([key, label]) => (
                      <button key={key} type="button" aria-pressed={contrastView === key} onClick={() => setContrastView(key)} className={contrastView === key ? "rounded-full px-3 py-2 text-xs font-semibold text-white" : "rounded-full border bg-white px-3 py-2 text-xs font-semibold text-[#51483E]"} style={contrastView === key ? { backgroundColor: design.button_color ?? INVITATION_PALETTES[templateKey].button_color ?? "#20272D" } : { borderColor: design.border_color ?? INVITATION_PALETTES[templateKey].border_color ?? "#D9D8D1" }}>{label}</button>
                    ))}
                  </div>
                  {(() => {
                    const palette = INVITATION_PALETTES[templateKey];
                    const background = contrastView === "general" ? design.background_color ?? palette.background_color ?? "#F5F3EE"
                      : contrastView === "cards" ? design.card_background_color ?? palette.card_background_color ?? "#FFFFFF"
                      : contrastView === "buttons" ? design.button_color ?? palette.button_color ?? "#20272D"
                      : design.rsvp_background_color ?? palette.rsvp_background_color ?? "#EAE7DF";
                    const foreground = contrastView === "general" ? design.text_color ?? palette.text_color ?? "#20272D"
                      : contrastView === "cards" ? design.card_text_color ?? palette.card_text_color ?? "#20272D"
                      : contrastView === "buttons" ? design.button_text_color ?? palette.button_text_color ?? "#FFFFFF"
                      : design.rsvp_text_color ?? palette.rsvp_text_color ?? "#20272D";
                    const heading = contrastView === "general" ? design.title_color ?? palette.title_color ?? foreground : foreground;
                    const border = design.border_color ?? palette.border_color ?? "#D9D8D1";
                    return (
                      <div className="mt-3 overflow-hidden rounded-xl border" style={{ backgroundColor: background, color: foreground, borderColor: border }}>
                        <div className="p-4">
                          <p className="text-base font-semibold" style={{ color: heading }}>{contrastView === "general" ? "Una invitación especial" : contrastView === "cards" ? "Detalles del evento" : contrastView === "buttons" ? "Acción principal" : "¿Nos acompañas?"}</p>
                          <p className="mt-2 text-sm leading-6">{contrastView === "general" ? "Nos encantará compartir este día contigo." : contrastView === "cards" ? "Sábado · 6:00 p. m. · Salón de eventos" : contrastView === "buttons" ? "Así se verá el texto en tus botones." : "La confirmación y su formulario conservan su identidad."}</p>
                          <span className="mt-3 inline-flex min-h-9 items-center rounded-full px-4 text-xs font-semibold" style={{ backgroundColor: contrastView === "buttons" ? background : design.button_color ?? palette.button_color ?? "#20272D", color: contrastView === "buttons" ? foreground : design.button_text_color ?? palette.button_text_color ?? "#FFFFFF" }}>{contrastView === "buttons" ? "Texto del botón" : "Confirmar asistencia"}</span>
                          {contrastView === "confirmation" && <div className="mt-3 rounded-lg border p-3 text-sm" style={{ backgroundColor: design.form_background_color ?? palette.form_background_color ?? "#FFFFFF", color: design.form_text_color ?? palette.form_text_color ?? "#20272D", borderColor: border }}>Ejemplo de formulario de confirmación</div>}
                        </div>
                      </div>
                    );
                  })()}
                  <p className="mt-2 text-xs text-[#62594F]">La muestra usa los colores actuales de «{TEMPLATE_OPTIONS.find((option) => option.key === templateKey)?.label}» y se actualiza al cambiar cada valor.</p>
                </div>
                <div className="rounded-xl border border-[#D9C7AA] bg-white p-3 sm:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62594F]">Consejo de legibilidad</p>
                  <p className="mt-2 text-sm leading-6 text-[#332B27]">Usa fondos claros con texto oscuro o fondos oscuros con texto claro. Los tonos decorativos funcionan mejor en bordes y detalles que en textos pequeños.</p>
                  <button type="button" onClick={() => { setDesign({ ...initialDesignForTemplate(templateKey), cover_image_url: design.cover_image_url, wax_seal_image_url: design.wax_seal_image_url }); toast.success("Se restauraron los colores originales de la plantilla."); }} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border bg-[#FBF7F0] px-4 py-2 text-sm font-semibold text-[#51483E] transition hover:bg-[#F3E8D7]" style={{ borderColor: design.border_color ?? INVITATION_PALETTES[templateKey].border_color ?? "#D9D8D1" }}>
                    <RotateCcw size={15} /> Restaurar colores de la plantilla
                  </button>
                  <p className="mt-2 text-xs leading-5 text-[#7D7467]">Se recupera la paleta inicial de «{TEMPLATE_OPTIONS.find((option) => option.key === templateKey)?.label}». La portada se conserva.</p>
                </div>
              </div>
              <div className="space-y-4">
                <ColorGroup title="General" description="Colores principales de la invitación." >
                  <ColorField label="Fondo general" value={design.background_color ?? INVITATION_PALETTES[templateKey].background_color ?? "#F5F3EE"} onChange={(v) => updateDesign("background_color", v)} />
                  <ColorField label="Texto general" value={design.text_color ?? INVITATION_PALETTES[templateKey].text_color ?? "#20272D"} onChange={(v) => updateDesign("text_color", v)} />
                  <ColorField label="Título principal" value={design.title_color ?? design.text_color ?? INVITATION_PALETTES[templateKey].title_color ?? "#20272D"} onChange={(v) => updateDesign("title_color", v)} />
                  <ColorField label="Acentos e íconos" value={design.accent_color ?? INVITATION_PALETTES[templateKey].accent_color ?? "#344B61"} onChange={(v) => updateDesign("accent_color", v)} />
                  <ColorField label="Bordes y divisores" value={design.border_color ?? INVITATION_PALETTES[templateKey].border_color ?? "#D9D8D1"} onChange={(v) => updateDesign("border_color", v)} />
                </ColorGroup>
                <ColorGroup title="Tarjetas" description="Fondo y texto de las tarjetas de información.">
                  <ColorField label="Fondo de tarjetas" value={design.card_background_color ?? INVITATION_PALETTES[templateKey].card_background_color ?? "#F5F3EE"} onChange={(v) => updateDesign("card_background_color", v)} />
                  <ColorField label="Texto de tarjetas" value={design.card_text_color ?? design.text_color ?? INVITATION_PALETTES[templateKey].card_text_color ?? "#20272D"} onChange={(v) => updateDesign("card_text_color", v)} />
                </ColorGroup>
                <ColorGroup title="Botones" description="Color del botón y del texto que aparece en él.">
                  <ColorField label="Fondo de botones" value={design.button_color ?? INVITATION_PALETTES[templateKey].button_color ?? "#20272D"} onChange={(v) => updateDesign("button_color", v)} />
                  <ColorField label="Texto de botones" value={design.button_text_color ?? "#FFFFFF"} onChange={(v) => updateDesign("button_text_color", v)} />
                </ColorGroup>
                <ColorGroup title="Confirmación" description="Colores de la confirmación de asistencia y su formulario.">
                  <ColorField label="Fondo de confirmación" value={design.rsvp_background_color ?? INVITATION_PALETTES[templateKey].rsvp_background_color ?? "#EAE7DF"} onChange={(v) => updateDesign("rsvp_background_color", v)} />
                  <ColorField label="Texto de confirmación" value={design.rsvp_text_color ?? design.text_color ?? INVITATION_PALETTES[templateKey].rsvp_text_color ?? "#20272D"} onChange={(v) => updateDesign("rsvp_text_color", v)} />
                  <ColorField label="Fondo del formulario" value={design.form_background_color ?? INVITATION_PALETTES[templateKey].form_background_color ?? "#F5F3EE"} onChange={(v) => updateDesign("form_background_color", v)} />
                  <ColorField label="Texto del formulario" value={design.form_text_color ?? design.text_color ?? INVITATION_PALETTES[templateKey].form_text_color ?? "#20272D"} onChange={(v) => updateDesign("form_text_color", v)} />
                </ColorGroup>
              </div>
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

function Field({ label, value, onChange, placeholder, type = "text", maxLength = 300 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: "text" | "time" | "date"; maxLength?: number }) {
  return (
    <label className="block text-sm font-medium text-[#4E463D]">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm text-[#332B27] outline-none transition focus:border-[#A88249]" />
    </label>
  );
}

function ColorGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#E7DCC8] bg-[#FDFBF8] p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-[#332B27]">{title}</h4>
        <p className="mt-1 text-xs leading-5 text-[#7D7467]">{description}</p>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const validColor = /^#[0-9a-fA-F]{6}$/.test(draft);
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#9A7358";

  // Sync external palette changes (template/reset) without a setState effect.
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value);
  }

  function commitDraft() {
    if (/^#[0-9a-fA-F]{6}$/.test(draft)) {
      onChange(draft.toUpperCase());
    } else {
      setDraft(value);
      toast.error(`El color de «${label}» debe tener formato #RRGGBB.`);
    }
  }

  return (
    <div className="min-w-0 text-sm font-medium text-[#4E463D]">
      <label className="block" htmlFor={`color-picker-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>{label}</label>
      <div className="mt-1.5 flex min-w-0 items-center gap-2 rounded-xl border border-[#E7DCC8] bg-white p-2">
        <input
          id={`color-picker-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
          type="color"
          aria-label={`Selector de color: ${label}`}
          value={pickerValue}
          onChange={(e) => {
            setDraft(e.target.value.toUpperCase());
            onChange(e.target.value.toUpperCase());
          }}
          className="h-9 w-10 shrink-0 cursor-pointer border-0 bg-transparent"
        />
        <input
          type="text"
          aria-label={`Código hexadecimal: ${label}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
          maxLength={7}
          placeholder="#RRGGBB"
          spellCheck={false}
          autoCapitalize="characters"
          className={`min-w-0 w-full rounded-md border bg-[#FDFBF8] px-2 py-2 text-sm font-mono text-[#4E463D] outline-none focus:ring-1 ${validColor ? "border-[#E7DCC8] focus:border-[#A88249] focus:ring-[#A88249]/30" : "border-[#C66B5D] focus:border-[#C66B5D] focus:ring-[#C66B5D]/30"}`}
        />
      </div>
      {!validColor && (
        <span className="mt-1 block text-xs font-normal text-[#9A4B40]">
          Escribe un código hexadecimal de 6 dígitos, por ejemplo #A78645.
        </span>
      )}
    </div>
  );
}

/* Retry Vercel deployment after TypeScript fallback fix. */

/* Retry Vercel deployment after palette editor type fix. */
