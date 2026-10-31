"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import PublicInvitationClient from "@/components/invitations/PublicInvitationClient";
import type { InvitationContent, InvitationDesign, InvitationTemplateKey, PublicInvitation } from "@/types/invitation";
import { INVITATION_PALETTES, INVITATION_TEMPLATE_OPTIONS } from "@/lib/invitation-palettes";

type DraftRow = {
  draft_id: string;
  draft_reference: string;
  event_type: string;
  package: "essential" | "plus";
  template_key: InvitationTemplateKey;
  design_config: InvitationDesign;
  content_config: InvitationContent;
  event_date: string | null;
  status: string;
  payment_status: string;
  editing_enabled: boolean;
};

const SHOPIFY_URLS = {
  essential: "https://melissartedecorativo.com/products/invitacion-digital-para-tu-evento?variant=67790310834269",
  plus: "https://melissartedecorativo.com/products/invitacion-digital-para-tu-evento?variant=67790310867037",
};

export default function InvitationDraftEditor({ token }: { token: string }) {
  const [draft, setDraft] = useState<DraftRow | null>(null);
  const [content, setContent] = useState<InvitationContent>({});
  const [design, setDesign] = useState<InvitationDesign>({});
  const [eventDate, setEventDate] = useState("");
  const [template, setTemplate] = useState<InvitationTemplateKey>("wedding_editorial");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewHistoryEntry = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: loadError } = await supabase.rpc("get_invitation_draft", { p_access_token: token });
      if (!active) return;
      const row = data?.[0] as DraftRow | undefined;
      if (loadError || !row) {
        setError("Este enlace no es válido o ya no está disponible.");
      } else {
        setDraft(row);
        setContent({ ...(row.content_config ?? {}), intro_headline: row.content_config?.intro_headline || "Un momento para compartir", introduction: row.content_config?.introduction || "Nos encantará contar con tu presencia y compartir juntos este día tan especial." });
        setDesign({ ...(row.design_config ?? {}), art_direction_version: 2 });
        const dateFromUrl = new URLSearchParams(window.location.search).get("fecha");
        setEventDate(row.event_date ?? dateFromUrl ?? "");
        setTemplate(row.template_key);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!previewOpen) return;
    window.history.pushState({ ...(window.history.state ?? {}), invitationPreview: true }, "", window.location.href);
    previewHistoryEntry.current = true;
    const onPopState = () => { previewHistoryEntry.current = false; setPreviewOpen(false); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [previewOpen]);

  function closePreview() {
    if (previewHistoryEntry.current && window.history.state?.invitationPreview) window.history.back();
    else { previewHistoryEntry.current = false; setPreviewOpen(false); }
  }

  const palette = INVITATION_PALETTES[template];
  const eventLabels: Record<string, string> = { wedding: "Boda", xv: "Mis XV", baby_shower: "Baby shower", baptism: "Mi bautizo", other: "Mi celebración" };
  const preview: PublicInvitation | null = useMemo(() => draft ? ({
    invitation_id: draft.draft_id,
    event_id: draft.draft_id,
    event_title: content.headline || "Tu evento",
    event_date: eventDate || null,
    event_type: draft.event_type,
    event_slug: draft.draft_reference.toLowerCase(),
    invitation_slug: "preview-" + draft.draft_reference.toLowerCase(),
    template_key: template,
    design_config: { ...palette, ...design },
    content_config: draft.payment_status === "pending" ? { ...content, event_label: eventLabels[draft.event_type] ?? "Mi celebración", ceremony_time: undefined, ceremony_venue: undefined, ceremony_address: undefined, reception_title: undefined, religious_ceremony_enabled: true, religious_ceremony_time: content.religious_ceremony_time || "17:00", religious_ceremony_venue: content.religious_ceremony_venue || "Lugar de ceremonia (ejemplo)", religious_ceremony_address: content.religious_ceremony_address || "Dirección de ejemplo", dress_code: content.dress_code || "Formal", gift_message: content.gift_message || "Tu presencia es nuestro mejor regalo.", confirmation_mode: content.confirmation_mode || "rsvp" } : content,
    rsvp_enabled: true,
    max_party_size: 5,
    invitation_status: "draft",
    cover_image: design.cover_image_url ?? null,
    cover_position_y: null,
  }) : null, [draft, content, design, eventDate, template, palette]);

  const draftUrl = typeof window !== "undefined" ? `${window.location.origin}/borrador/${token}` : "";

  async function copyDraftLink() {
    try {
      await navigator.clipboard.writeText(draftUrl);
      setLinkCopied(true);
      setNotice("Enlace del borrador copiado. Guárdalo para continuar después.");
    } catch {
      setError("No fue posible copiar el enlace. Puedes copiarlo desde la barra de direcciones.");
    }
  }

  function shareDraftWhatsApp() {
    const message = `Aquí puedes continuar editando tu invitación de Melissarte: ${draftUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function hasRequiredDetails() { return Boolean(eventDate && design.cover_image_url && content.headline?.trim() && content.reception_time && content.reception_venue?.trim() && content.reception_address?.trim()); }

  async function save(openPreviewAfterSave = false) {
    if (!eventDate) { setError("Selecciona la fecha de tu evento para continuar."); return; }
    if (openPreviewAfterSave && !hasRequiredDetails()) { setError("Completa la foto, el título y los datos de recepción para ver tu invitación."); return; }
    setSaving(true);
    setError("");
    setNotice("");
    const { data, error: saveError } = await supabase.rpc("update_invitation_draft", {
      p_access_token: token,
      p_template_key: template,
      p_design_config: design,
      p_content_config: { ...content, event_label: draft?.payment_status === "pending" ? (eventLabels[draft.event_type] ?? "Mi celebración") : content.event_label },
      p_event_date: eventDate,
    });
    if (saveError || data !== true) {
      setError(saveError?.message ?? "No fue posible guardar. Es posible que la edición esté bloqueada.");
    } else {
      setNotice("Cambios guardados.");
      if (openPreviewAfterSave) setPreviewOpen(true);
    }
    setSaving(false);
  }

  async function uploadCover(file: File) {
    if (!draft || locked || (draft.payment_status !== "pending" && !(draft.payment_status === "paid" && draft.editing_enabled))) return;
    setUploading(true); setError(""); setNotice("");
    try {
      const { data: signed, error: signError } = await supabase.functions.invoke("upload-invitation-draft-cover", { body: { access_token: token, content_type: file.type } });
      if (signError || !signed?.path || !signed?.token) throw new Error(signError?.message ?? "No se pudo preparar la carga.");
      const { error: uploadError } = await supabase.storage.from("event-covers").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from("event-covers").getPublicUrl(signed.path);
      setDesign(current => ({ ...current, cover_image_url: publicUrl.publicUrl }));
      setNotice("Portada cargada. Guarda los cambios para conservarla.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No fue posible cargar la portada.");
    } finally { setUploading(false); }
  }

  async function orderByWhatsApp(selected: "essential" | "plus") {
    if (!eventDate) { setError("Selecciona la fecha de tu evento para continuar."); return; }
    const whatsappWindow = window.open("about:blank", "_blank");
    if (!whatsappWindow) {
      setError("Permite las ventanas emergentes para continuar por WhatsApp.");
      return;
    }
    setSaving(true);
    setError("");
    const { data: saved, error: saveError } = await supabase.rpc("update_invitation_draft", {
      p_access_token: token,
      p_template_key: template,
      p_design_config: design,
      p_content_config: { ...content, event_label: draft?.payment_status === "pending" ? (eventLabels[draft.event_type] ?? "Mi celebración") : content.event_label },
      p_event_date: eventDate,
    });
    if (saveError || saved !== true) {
      whatsappWindow.close();
      setError(saveError?.message ?? "No fue posible guardar tu invitación. Inténtalo nuevamente.");
      setSaving(false);
      return;
    }
    const packageName = selected === "plus" ? "Plus" : "Esencial";
    const price = selected === "plus" ? "$349 MXN" : "$199 MXN";
    const message = [
      "Hola, quiero ordenar mi invitación digital por WhatsApp.",
      "Paquete: " + packageName + " (" + price + ").",
      "Tipo de evento: " + (eventLabels[draft?.event_type ?? ""] ?? "Mi celebración") + ".",
      "Referencia de mi borrador: " + (draft?.draft_reference ?? "") + ".",
      "Pueden revisar mi avance aquí: " + draftUrl,
    ].join("\n");
    whatsappWindow.location.href = "https://wa.me/528133867050?text=" + encodeURIComponent(message);
    setNotice("Guardamos tus cambios. Continúa la conversación por WhatsApp para completar tu pedido.");
    setSaving(false);
  }

  async function continueToCheckout(selected: "essential" | "plus") {
    if (!eventDate) { setError("Selecciona la fecha de tu evento para continuar."); return; }
    if (!hasRequiredDetails()) { setError("Antes de continuar, completa la foto de portada, el título y los datos de recepción."); return; }
    const { data: saved, error: saveError } = await supabase.rpc("update_invitation_draft", { p_access_token: token, p_template_key: template, p_design_config: design, p_content_config: { ...content, event_label: draft?.payment_status === "pending" ? (eventLabels[draft.event_type] ?? "Mi celebración") : content.event_label }, p_event_date: eventDate });
    if (saveError || saved !== true) { setError(saveError?.message ?? "No fue posible guardar los datos antes de la compra."); return; }
    setSaving(true);
    setError("");
    const { data, error: packageError } = await supabase.rpc("set_invitation_draft_package", {
      p_access_token: token,
      p_package: selected,
    });
    if (packageError || data !== true) {
      setError(packageError?.message ?? "No fue posible preparar la compra.");
      setSaving(false);
      return;
    }
    const params = new URLSearchParams();
    params.set("properties[Referencia del borrador]", draft?.draft_reference ?? "");
    params.set("properties[Tipo de evento]", draft?.event_type ?? "");
    window.location.href = SHOPIFY_URLS[selected] + "&" + params.toString();
  }

  if (loading) return <main className="min-h-screen bg-[#F8F6F2] p-8 text-center text-sm text-[#746A5D]">Cargando tu invitación...</main>;
  if (!draft) return <main className="min-h-screen bg-[#F8F6F2] p-8 text-center"><h1 className="text-xl font-semibold">Borrador no disponible</h1><p className="mt-2 text-sm text-[#746A5D]">{error}</p></main>;

  const locked = draft.payment_status === "rejected" || (draft.payment_status === "paid" && !draft.editing_enabled) || draft.status === "cancelled" || draft.status === "published";
  const update = (key: keyof InvitationContent, value: string) => setContent(current => ({ ...current, [key]: value }));

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#27251F]">
      <header className="border-b border-[#E7DFD3] bg-white px-5 py-5">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#A88249]">Melissarte Events</p>
          <h1 className="mt-1 text-2xl font-semibold">Dale forma a tu invitación</h1>
          <p className="mt-1 text-xs text-[#746A5D]">Completa lo esencial, elige un diseño y revisa cómo se verá. Tu avance queda guardado en este enlace.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={()=>void copyDraftLink()} className="rounded-full border border-[#D5B77C] px-4 py-2 text-xs font-semibold text-[#51483E]">{linkCopied ? "Enlace copiado ✓" : "Copiar enlace del borrador"}</button>
            <button type="button" onClick={shareDraftWhatsApp} className="rounded-full bg-[#263D4B] px-4 py-2 text-xs font-semibold text-white">Enviar por WhatsApp</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">1. Datos de tu evento</h2><p className="mt-1 text-xs leading-5 text-[#746A5D]">Empieza con la información que tus invitados necesitan conocer.</p></div><span className="shrink-0 rounded-full bg-[#F4EFE6] px-2.5 py-1 text-[10px] font-semibold text-[#806747]">{locked ? "Edición bloqueada" : "Borrador"}</span></div>
            <label className="mt-4 block text-sm font-medium">Portada de tu invitación <span className="text-[#A35B4D]">*</span><input disabled={locked || (draft.payment_status !== "pending" && !(draft.payment_status === "paid" && draft.editing_enabled)) || uploading} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file) void uploadCover(file);e.currentTarget.value="";}} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#F2EBE1] file:px-3 file:py-2 file:text-xs file:font-semibold disabled:opacity-50" /></label>
            {design.cover_image_url && <div className="mt-3 flex w-full justify-center"><img src={design.cover_image_url} alt="Portada seleccionada" className="aspect-square w-full max-w-[320px] rounded-xl object-cover object-center" /></div>}
            <label className="mt-4 block text-sm font-medium">Título o nombres <span className="text-[#A35B4D]">*</span><input required disabled={locked} value={content.headline ?? ""} onChange={e=>update("headline",e.target.value)} maxLength={120} placeholder="Ej. Sofía y Alejandro" className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Fecha del evento <span className="text-[#A35B4D]">*</span><input required disabled={locked} type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
          </div>
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <h2 className="font-semibold">2. Lugar de recepción</h2>
            <label className="mt-3 block text-sm font-medium">Nombre del lugar <span className="text-[#A35B4D]">*</span><input required disabled={locked} value={content.reception_venue ?? ""} onChange={e=>update("reception_venue",e.target.value)} maxLength={160} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Hora <span className="text-[#A35B4D]">*</span><input required disabled={locked} type="time" value={content.reception_time ?? ""} onChange={e=>update("reception_time",e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Dirección <span className="text-[#A35B4D]">*</span><textarea required disabled={locked} value={content.reception_address ?? ""} onChange={e=>update("reception_address",e.target.value)} maxLength={240} rows={2} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
          </div>
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">3. Elige el diseño</h2><p className="mt-1 text-xs leading-5 text-[#746A5D]">Prueba los diferentes estilos y elige el que más te guste. Puedes cambiarlo antes de comprar.</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {INVITATION_TEMPLATE_OPTIONS.map(option => { const colors = INVITATION_PALETTES[option.key]; const selected = template === option.key; return (
                <button key={option.key} type="button" disabled={locked} aria-pressed={selected} onClick={() => { setTemplate(option.key); setDesign(current => ({ ...current, ...colors, art_direction_version: 2 })); }} className={`overflow-hidden rounded-2xl border text-left transition ${selected ? "border-[#A88750] ring-2 ring-[#A88750]/25 shadow-md" : "border-[#E7DCC8] hover:border-[#C7AD82]"} disabled:opacity-50`}>
                  <div className="relative flex aspect-[4/3] items-center justify-center p-3" style={{ backgroundColor: colors.background_color }}><div className="w-[76%] rounded-sm border px-2 py-5 text-center shadow-sm" style={{ backgroundColor: colors.card_background_color, borderColor: colors.border_color }}><div className="mx-auto mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: colors.accent_color }} /><div className="mx-auto h-1.5 w-3/4 rounded-full" style={{ backgroundColor: colors.title_color }} /><div className="mx-auto mt-2 h-1 w-1/2 rounded-full" style={{ backgroundColor: colors.text_color, opacity: .55 }} /><div className="mx-auto mt-3 h-1 w-1/3 rounded-full" style={{ backgroundColor: colors.accent_color }} /></div>{selected && <span className="absolute right-2 top-2 rounded-full bg-[#263D4B] px-2 py-1 text-[10px] font-semibold text-white">✓ Elegida</span>}</div>
                  <div className="p-3"><p className="text-sm font-semibold text-[#332B27]">{option.label}</p><p className="mt-1 min-h-[2.5rem] text-[11px] leading-4 text-[#746A5D]">{option.description}</p><div className="mt-2 flex gap-1.5">{[colors.background_color, colors.title_color, colors.accent_color, colors.button_color].map((color,index)=><span key={index} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}</div></div>
                </button>); })}
            </div>
            <p className="mt-4 rounded-xl bg-[#F8F6F2] px-3 py-2.5 text-xs leading-5 text-[#746A5D]">La plantilla y la paleta se pueden cambiar antes de pagar. Los colores y ajustes avanzados se habilitan después de confirmar tu compra.</p>
            <button disabled={locked || saving} onClick={()=>void save()} className="mt-4 w-full rounded-full bg-[#263D4B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar cambios"}</button>
            <button disabled={locked || saving || uploading || !hasRequiredDetails()} onClick={()=>void save(true)} className="mt-2 w-full rounded-full border border-[#D5B77C] px-4 py-3 text-sm font-semibold text-[#51483E] disabled:opacity-40">Guardar y ver invitación completa</button>
            <p className="mt-2 text-xs leading-5 text-[#8A8074]">Para crear la vista previa necesitas foto, título, fecha y todos los datos de recepción. Los detalles adicionales aparecerán con ejemplos y podrás personalizarlos después de la compra.</p>
            {notice && <p role="status" className="mt-2 text-sm text-green-700">{notice}</p>}{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="rounded-2xl border border-[#D5B77C] bg-[#FFFEFC] p-5">
            <h2 className="font-semibold">{draft.payment_status === "paid" ? "Tu compra" : "4. Elige cómo continuar"}</h2>
            <p className="mt-1 text-sm text-[#746A5D]">{draft.payment_status === "paid" ? (draft.editing_enabled ? `Tu paquete ${draft.package === "plus" ? "Plus" : "Esencial"} está habilitado. Puedes continuar con los ajustes autorizados.` : "Tu pago fue validado. Estamos preparando la siguiente etapa de edición.") : "Elige el paquete que incluya las herramientas que necesitas para tu evento."}</p>
            <button disabled={saving || locked || draft.payment_status !== "pending" || !hasRequiredDetails()} onClick={()=>continueToCheckout("essential")} className="mt-4 w-full rounded-full bg-[#263D4B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Elegir Esencial · $199 MXN</button>
            <button disabled={saving || locked || draft.payment_status !== "pending" || !hasRequiredDetails()} onClick={()=>continueToCheckout("plus")} className="mt-2 w-full rounded-full border border-[#D5B77C] px-4 py-3 text-sm font-semibold text-[#51483E] disabled:opacity-50">Elegir Plus · $349 MXN</button>
            {draft.payment_status === "pending" && (
              <div className="mt-5 border-t border-[#E9E0D3] pt-4">
                <p className="text-center text-xs leading-5 text-[#746A5D]">¿Prefieres que te atendamos personalmente?</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button disabled={saving || locked || !hasRequiredDetails()} onClick={()=>void orderByWhatsApp("essential")} className="w-full rounded-full border border-[#B8CDBB] bg-white px-3 py-3 text-sm font-semibold text-[#315D43] transition hover:bg-[#F3F8F3] disabled:opacity-50">Ordenar Esencial por WhatsApp</button>
                  <button disabled={saving || locked || !hasRequiredDetails()} onClick={()=>void orderByWhatsApp("plus")} className="w-full rounded-full border border-[#B8CDBB] bg-white px-3 py-3 text-sm font-semibold text-[#315D43] transition hover:bg-[#F3F8F3] disabled:opacity-50">Ordenar Plus por WhatsApp</button>
                </div>
                <p className="mt-2 text-center text-[11px] leading-4 text-[#8A8074]">Te ayudaremos a completar tu pedido sin necesidad de pagar directamente en Shopify.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {previewOpen && preview && (
        <div className="fixed inset-0 z-[100] flex min-h-0 flex-col bg-[#F8F6F2]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E7DCC8] bg-white px-4 py-3">
            <h2 className="text-sm font-semibold">Vista previa de tu invitación</h2>
            <div className="flex gap-2">
              <button type="button" onClick={closePreview} className="rounded-full border px-4 py-2 text-xs font-semibold">Volver a editar</button>
              <button type="button" disabled={saving} onClick={()=>void save()} className="rounded-full bg-[#263D4B] px-4 py-2 text-xs font-semibold text-white">Guardar</button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="min-h-full w-full bg-white">
              <PublicInvitationClient invitation={preview} existingRSVP={null} editToken={null} editRequested={false} previewMode />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
