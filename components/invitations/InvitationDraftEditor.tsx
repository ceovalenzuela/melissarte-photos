"use client";

import { useEffect, useMemo, useState } from "react";
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
        setContent(row.content_config ?? {});
        setDesign(row.design_config ?? {});
        setEventDate(row.event_date ?? "");
        setTemplate(row.template_key);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [token]);

  const palette = INVITATION_PALETTES[template];
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
    content_config: content,
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

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    const { data, error: saveError } = await supabase.rpc("update_invitation_draft", {
      p_access_token: token,
      p_template_key: template,
      p_design_config: design,
      p_content_config: content,
      p_event_date: eventDate || null,
    });
    if (saveError || data !== true) {
      setError(saveError?.message ?? "No fue posible guardar. Es posible que la edición esté bloqueada.");
    } else {
      setNotice("Cambios guardados.");
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

  async function continueToCheckout(selected: "essential" | "plus") {
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
          <h1 className="mt-1 text-2xl font-semibold">Personaliza tu invitación</h1>
          <p className="mt-1 text-xs text-[#746A5D]">Referencia: {draft.draft_reference} · Guarda tu enlace privado para continuar después.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={()=>void copyDraftLink()} className="rounded-full border border-[#D5B77C] px-4 py-2 text-xs font-semibold text-[#51483E]">{linkCopied ? "Enlace copiado ✓" : "Copiar enlace del borrador"}</button>
            <button type="button" onClick={shareDraftWhatsApp} className="rounded-full bg-[#263D4B] px-4 py-2 text-xs font-semibold text-white">Enviar por WhatsApp</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Datos principales</h2><span className="text-xs text-[#8A8074]">{locked ? "Edición bloqueada" : "Borrador"}</span></div>
            <label className="mt-4 block text-sm font-medium">Portada de tu invitación<input disabled={locked || (draft.payment_status !== "pending" && !(draft.payment_status === "paid" && draft.editing_enabled)) || uploading} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file) void uploadCover(file);e.currentTarget.value="";}} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#F2EBE1] file:px-3 file:py-2 file:text-xs file:font-semibold disabled:opacity-50" /></label>
            {design.cover_image_url && <img src={design.cover_image_url} alt="Portada seleccionada" className="mt-3 aspect-[4/3] w-full rounded-xl object-cover" />}
            <label className="mt-4 block text-sm font-medium">Título o nombres<input disabled={locked} value={content.headline ?? ""} onChange={e=>update("headline",e.target.value)} maxLength={120} placeholder="Ej. Sofía y Alejandro" className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Texto secundario<input disabled={locked} value={content.subtitle ?? ""} onChange={e=>update("subtitle",e.target.value)} maxLength={180} placeholder="Nos encantará compartir..." className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Anfitriones<input disabled={locked} value={content.host_names ?? ""} onChange={e=>update("host_names",e.target.value)} maxLength={160} placeholder="Nombres" className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Fecha del evento<input disabled={locked} type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
          </div>
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <h2 className="font-semibold">Recepción</h2>
            <label className="mt-3 block text-sm font-medium">Nombre del lugar<input disabled={locked} value={content.reception_venue ?? ""} onChange={e=>update("reception_venue",e.target.value)} maxLength={160} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Hora<input disabled={locked} type="time" value={content.reception_time ?? ""} onChange={e=>update("reception_time",e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
            <label className="mt-3 block text-sm font-medium">Dirección<textarea disabled={locked} value={content.reception_address ?? ""} onChange={e=>update("reception_address",e.target.value)} maxLength={240} rows={2} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]" /></label>
          </div>
          <div className="rounded-2xl border border-[#E7DCC8] bg-white p-5">
            <h2 className="font-semibold">Plantilla y paleta</h2>
            <select disabled={locked} value={template} onChange={e=>{const key=e.target.value as InvitationTemplateKey;setTemplate(key);setDesign(INVITATION_PALETTES[key]);}} className="mt-3 w-full rounded-xl border border-[#E7DCC8] bg-white px-3 py-2.5 text-sm disabled:bg-[#F4F1EC]">
              {INVITATION_TEMPLATE_OPTIONS.map(option=><option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
            <p className="mt-2 text-xs text-[#746A5D]">La paleta prediseñada cambia junto con la plantilla. La personalización avanzada se habilita después de validar tu pago.</p>
            <button disabled={locked || saving} onClick={save} className="mt-4 w-full rounded-full bg-[#263D4B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{uploading ? "Subiendo portada..." : saving ? "Guardando..." : "Guardar cambios"}</button>
            {notice && <p role="status" className="mt-2 text-sm text-green-700">{notice}</p>}
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="rounded-2xl border border-[#D5B77C] bg-[#FFFEFC] p-5">
            <h2 className="font-semibold">{draft.payment_status === "paid" ? "Pago validado" : "Continúa con tu compra"}</h2>
            <p className="mt-1 text-sm text-[#746A5D]">{draft.payment_status === "paid" ? (draft.editing_enabled ? `Tu paquete ${draft.package === "plus" ? "Plus" : "Esencial"} está habilitado. Puedes continuar con los ajustes autorizados.` : "Tu pago fue validado. Estamos preparando la siguiente etapa de edición.") : "Al finalizar, tu borrador quedará asociado al pedido para que podamos validar el pago y habilitar la edición."}</p>
            <button disabled={saving || locked || draft.payment_status !== "pending"} onClick={()=>continueToCheckout("essential")} className="mt-4 w-full rounded-full bg-[#263D4B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Elegir Esencial · $199 MXN</button>
            <button disabled={saving || locked || draft.payment_status !== "pending"} onClick={()=>continueToCheckout("plus")} className="mt-2 w-full rounded-full border border-[#D5B77C] px-4 py-3 text-sm font-semibold text-[#51483E] disabled:opacity-50">Elegir Plus · $349 MXN</button>
          </div>
        </section>
        <section className="min-w-0">
          <div className="sticky top-4 overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white">
            <div className="border-b border-[#EEE4D5] px-4 py-3"><h2 className="text-sm font-semibold">Vista previa</h2></div>
            <div className="max-h-[82vh] overflow-y-auto">{preview && <PublicInvitationClient invitation={preview} existingRSVP={null} editToken={null} editRequested={false} previewMode />}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
