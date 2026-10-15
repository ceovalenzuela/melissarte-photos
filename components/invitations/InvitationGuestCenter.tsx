"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, Download, Edit2, FileSpreadsheet, MessageCircle, Minus, Plus, RefreshCw, Save, Search, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Guest = { guest_id: string; guest_name: string; phone: string; family_group: string; passes: number; delivery_status: "pending" | "sent"; sent_at: string | null; created_at: string; attendance_status: "attending" | "declined" | null; party_size: number | null; rsvp_updated_at: string | null };
type Draft = { name: string; phone: string; countryCode: string; group: string; passes: number };
type ImportRow = Omit<Draft, "countryCode"> & { row: number; error?: string };
const emptyDraft: Draft = { name: "", phone: "", countryCode: "52", group: "", passes: 1 };
const countryCodes = [
  { code: "52", iso: "MX", name: "México" }, { code: "1", iso: "US/CA", name: "Estados Unidos / Canadá" },
  { code: "54", iso: "AR", name: "Argentina" }, { code: "55", iso: "BR", name: "Brasil" }, { code: "56", iso: "CL", name: "Chile" },
  { code: "57", iso: "CO", name: "Colombia" }, { code: "34", iso: "ES", name: "España" }, { code: "502", iso: "GT", name: "Guatemala" },
  { code: "503", iso: "SV", name: "El Salvador" }, { code: "504", iso: "HN", name: "Honduras" }, { code: "505", iso: "NI", name: "Nicaragua" },
  { code: "506", iso: "CR", name: "Costa Rica" }, { code: "507", iso: "PA", name: "Panamá" }, { code: "51", iso: "PE", name: "Perú" },
  { code: "58", iso: "VE", name: "Venezuela" }, { code: "44", iso: "GB", name: "Reino Unido" },
];
const normalizePhone = (v: string) => v.replace(/\D/g, "");
const whatsappPhone = (v: string) => { const digits = normalizePhone(v); return digits.length === 10 ? `52${digits}` : digits; };
const csvRows = (text: string): string[][] => {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  return rows;
};
const cellText = (node: Element | null) => node?.textContent?.trim() ?? "";
async function parseSpreadsheet(file: File): Promise<string[][]> {
  if (/\.csv$/i.test(file.name) || file.type === "text/csv") return csvRows((await file.text()).replace(/^\uFEFF/, ""));
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const workbook = await zip.file("xl/workbook.xml")?.async("text");
  const rels = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
  if (!workbook || !rels) throw new Error("No pude leer el archivo Excel. Guárdalo como .xlsx o .csv.");
  const parser = new DOMParser();
  const wb = parser.parseFromString(workbook, "application/xml");
  const relationships = parser.parseFromString(rels, "application/xml");
  const firstSheet = wb.getElementsByTagName("sheet")[0];
  const relId = firstSheet?.getAttribute("r:id");
  const rel = Array.from(relationships.getElementsByTagName("Relationship")).find(x => x.getAttribute("Id") === relId);
  const target = rel?.getAttribute("Target");
  if (!target) throw new Error("El Excel no contiene una primera hoja legible.");
  const sheetPath = target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, "");
  const sheetXml = await zip.file(sheetPath)?.async("text");
  if (!sheetXml) throw new Error("No pude leer la primera hoja del Excel.");
  const sheet = parser.parseFromString(sheetXml, "application/xml");
  const sharedXml = await zip.file("xl/sharedStrings.xml")?.async("text");
  const shared = sharedXml ? Array.from(parser.parseFromString(sharedXml, "application/xml").getElementsByTagName("si")).map(si => Array.from(si.getElementsByTagName("t")).map(t => t.textContent ?? "").join("")) : [];
  return Array.from(sheet.getElementsByTagName("row")).map(r => {
    const cells = Array.from(r.getElementsByTagName("c")); const values: string[] = [];
    for (const c of cells) {
      const match = (c.getAttribute("r") ?? "").match(/^([A-Z]+)/); if (!match) continue;
      let col = 0; for (const ch of match[1]) col = col * 26 + ch.charCodeAt(0) - 64; col--;
      const v = cellText(c.getElementsByTagName("v")[0]); const inline = Array.from(c.getElementsByTagName("t")).map(t => t.textContent ?? "").join("");
      values[col] = c.getAttribute("t") === "s" ? (shared[Number(v)] ?? "") : (c.getAttribute("t") === "inlineStr" ? inline : v);
    }
    return values.map(v => v ?? "");
  }).filter(r => r.some(Boolean));
}
function mapImportRows(rows: string[][]): ImportRow[] {
  if (!rows.length) return [];
  const normalizeHeader = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const headers = rows[0].map(normalizeHeader);
  const find = (names: string[], fallback: number) => { const index = headers.findIndex(h => names.includes(h)); return index >= 0 ? index : fallback; };
  const nameIndex = find(["nombre", "nombre completo", "invitado", "name", "guest"], 0);
  const phoneIndex = find(["telefono", "celular", "whatsapp", "phone", "mobile"], 1);
  const groupIndex = find(["familia", "grupo", "grupo familiar", "family", "family group"], 2);
  const passesIndex = find(["pases", "boletos", "lugares", "personas", "passes", "seats"], 3);
  const hasHeader = headers.some(h => ["nombre", "nombre completo", "invitado", "name", "guest"].includes(h));
  return rows.slice(hasHeader ? 1 : 0).map((r, i) => {
    const name = (r[nameIndex] ?? "").trim(), phone = (r[phoneIndex] ?? "").trim(), group = (r[groupIndex] ?? "").trim();
    const parsedPasses = Number((r[passesIndex] ?? "1").trim() || "1");
    let error = "";
    if (!name) error = "Falta el nombre";
    else if (![10, 11, 12, 13, 14, 15].includes(normalizePhone(phone).length)) error = "Escribe un teléfono de 10 dígitos o con lada internacional.";
    else if (!Number.isInteger(parsedPasses) || parsedPasses < 1 || parsedPasses > 99) error = "Indica entre 1 y 99 pases.";
    return { row: i + (hasHeader ? 2 : 1), name, phone, group, passes: parsedPasses || 1, error: error || undefined };
  });
}
function downloadTemplate() {
  const csv = "Nombre,Telefono,Grupo familiar,Pases\nMaría López,8112345678,Familia López,3\nJuan Pérez,8187654321,Amigos,2\n";
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a"); a.href = url; a.download = "plantilla-invitados.csv"; a.click(); URL.revokeObjectURL(url);
}

export default function InvitationGuestCenter({ eventId, organizerToken, invitationSlug }: { eventId: string; organizerToken: string; invitationSlug?: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [showTools, setShowTools] = useState(false);
  const [expandedActions, setExpandedActions] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_invitation_guests_with_rsvp_token", { p_event_id: eventId, p_organizer_token: organizerToken });
    if (error) {
      console.error(error);
      setLoadError(true);
      toast.error("No fue posible cargar la lista. Inténtalo de nuevo.");
    } else {
      setGuests((data ?? []) as Guest[]);
      setLoadError(false);
    }
    setLoading(false);
  }, [eventId, organizerToken]);
  // Initial data fetch: state updates happen after the asynchronous Supabase request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadGuests(); }, [loadGuests]);

  const filtered = useMemo(() => guests.filter(g => {
    const q = query.trim().toLocaleLowerCase("es");
    const textMatch = !q || [g.guest_name, g.phone, g.family_group].some(v => v.toLocaleLowerCase("es").includes(q));
    const statusMatch = rsvpFilter === "all" || (rsvpFilter === "pending" ? !g.attendance_status : g.attendance_status === rsvpFilter);
    const deliveryMatch = deliveryFilter === "all" || g.delivery_status === deliveryFilter;
    return textMatch && statusMatch && deliveryMatch;
  }), [guests, query, rsvpFilter, deliveryFilter]);
  const passCount = guests.reduce((sum, g) => sum + g.passes, 0);
  const confirmedPassCount = guests.reduce((sum, g) => sum + (g.attendance_status === "attending" ? (g.party_size ?? 1) : 0), 0);
  const pendingRsvpCount = guests.filter(g => !g.attendance_status).length;
  const pendingDeliveryCount = guests.filter(g => g.delivery_status !== "sent").length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleGuests = filtered.slice((page - 1) * pageSize, page * pageSize);

  function closeGuestTools() {
    setShowTools(false);
    setImportRows([]);
    setEditing(null);
    setDraft(emptyDraft);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveGuest() {
    if (!draft.name.trim() || normalizePhone(draft.phone).length !== 10) { toast.error("Escribe el nombre y un teléfono válido de 10 dígitos."); return; }
    setSaving(true);
    const { error } = await supabase.rpc("save_invitation_guest_with_token", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: editing,
      p_name: draft.name.trim(), p_phone: `${draft.countryCode}${normalizePhone(draft.phone)}`, p_family_group: draft.group.trim(), p_passes: Number(draft.passes),
    });
    setSaving(false);
    if (error) { console.error(error); toast.error(error.message.includes("Ya existe") ? "Ya hay una invitación registrada con ese teléfono. Revisa la lista de invitados." : "No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo."); return; }
    toast.success(editing ? "Los cambios se guardaron." : "La invitación se agregó a tu lista.");
    setDraft(emptyDraft); setEditing(null); await loadGuests();
  }
  function startEdit(g: Guest) {
    const digits = normalizePhone(g.phone);
    const matchedCode = [...countryCodes].sort((a, b) => b.code.length - a.code.length).find(item => digits.startsWith(item.code) && digits.length === item.code.length + 10);
    setEditing(g.guest_id);
    setDraft({ name: g.guest_name, phone: matchedCode ? digits.slice(matchedCode.code.length) : digits.slice(-10), countryCode: matchedCode?.code ?? "52", group: g.family_group, passes: g.passes });
    setShowTools(true);
    requestAnimationFrame(() => document.getElementById("guest-tools-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function removeGuest(g: Guest) {
    if (!window.confirm(`¿Eliminar a ${g.guest_name} de la lista?`)) return;
    const { error } = await supabase.rpc("delete_invitation_guest_with_token", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id });
    if (error) toast.error("No se pudo eliminar el invitado."); else { toast.success("Invitado eliminado."); await loadGuests(); }
  }
  async function openWhatsApp(g: Guest) {
    if (!invitationSlug) { toast.error("Primero guarda y publica la invitación para generar su enlace."); return; }
    const whatsappWindow = window.open("about:blank", "_blank");
    if (!whatsappWindow) { toast.error("Permite las ventanas emergentes para abrir WhatsApp."); return; }
    const { data, error } = await supabase.rpc("get_or_create_invitation_guest_link", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id,
    });
    const personalToken = data?.[0]?.guest_token ?? data?.guest_token;
    if (error || typeof personalToken !== "string" || !personalToken) {
      whatsappWindow.close();
      toast.error("No fue posible generar el enlace personalizado. Inténtalo de nuevo.");
      return;
    }
    const link = new URL(`/i/${invitationSlug}`, window.location.origin);
    link.searchParams.set("invitado", personalToken);
    const message = `¡Hola ${g.guest_name}! Nos encantará compartir este momento contigo. Aquí puedes ver la invitación y los detalles del evento: ${link.toString()} Te reservamos ${g.passes} ${g.passes === 1 ? "pase" : "pases"}. ¡Esperamos verte!`;
    whatsappWindow.opener = null;
    whatsappWindow.location.href = `https://wa.me/${whatsappPhone(g.phone)}?text=${encodeURIComponent(message)}`;
    toast.info(g.delivery_status === "sent" ? "Abrimos WhatsApp. Esta invitación ya estaba marcada como enviada." : "Abrimos WhatsApp. Cuando termines de enviarla, marca el envío como realizado en la lista.");
  }
  async function copyPersonalLink(g: Guest) {
    if (!invitationSlug) { toast.error("Primero guarda y publica la invitación para generar su enlace."); return; }
    const { data, error } = await supabase.rpc("get_or_create_invitation_guest_link", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id,
    });
    const personalToken = data?.[0]?.guest_token ?? data?.guest_token;
    if (error || typeof personalToken !== "string" || !personalToken) {
      toast.error("No fue posible generar el enlace personalizado. Inténtalo de nuevo.");
      return;
    }
    const link = new URL(`/i/${encodeURIComponent(invitationSlug)}`, window.location.origin);
    link.searchParams.set("invitado", personalToken);
    try {
      await navigator.clipboard.writeText(link.toString());
      toast.success(`Enlace personalizado de ${g.guest_name} copiado.`);
    } catch {
      window.prompt(`Copia el enlace personalizado de ${g.guest_name}:`, link.toString());
    }
  }

  async function setDeliveryStatus(g: Guest, status: "pending" | "sent") {
    const { error } = await supabase.rpc("set_invitation_guest_delivery_status", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id, p_status: status,
    });
    if (error) { toast.error("No fue posible actualizar el estado de envío."); return; }
    setGuests(current => current.map(item => item.guest_id === g.guest_id ? { ...item, delivery_status: status, sent_at: status === "sent" ? new Date().toISOString() : null } : item));
    toast.success(status === "sent" ? "La invitación quedó marcada como enviada." : "La invitación quedó como pendiente de envío.");
  }

  async function handleFile(file?: File) {
    if (!file) return;
    try {
      const rows = await parseSpreadsheet(file);
      const mapped = mapImportRows(rows);
      const seen = new Set<string>();
      const validated = mapped.map(row => {
        const phone = normalizePhone(row.phone);
        let error = row.error;
        if (!error && seen.has(phone)) error = "Este teléfono aparece más de una vez en el archivo";
        if (!error && guests.some(g => normalizePhone(g.phone) === phone)) error = "Este teléfono ya está en la lista";
        seen.add(phone);
        return { ...row, error };
      });
      setImportRows(validated);
      if (!validated.length) toast.error("No encontré filas de invitados en el archivo.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "No pude leer el archivo."); }
    if (fileRef.current) fileRef.current.value = "";
  }
  async function importValidRows() {
    const valid = importRows.filter(r => !r.error);
    if (!valid.length) { toast.error("No hay filas válidas para importar."); return; }
    setImporting(true); let count = 0; const failures: string[] = [];
    for (const row of valid) {
      const importedDigits = normalizePhone(row.phone);
      const importedPhone = importedDigits.length === 10 ? `52${importedDigits}` : importedDigits;
      const { error } = await supabase.rpc("save_invitation_guest_with_token", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: null, p_name: row.name, p_phone: importedPhone, p_family_group: row.group, p_passes: row.passes });
      if (error) failures.push(`Fila ${row.row}: ${error.message}`); else count++;
    }
    setImporting(false); setImportRows([]); await loadGuests();
    if (failures.length) toast.error(`Se importaron ${count}; ${failures.length} no se pudieron guardar. Revisa duplicados.`);
    else toast.success(`Se importaron ${count} invitados.`);
  }

  return <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#E7DCC8] bg-white shadow-[0_16px_50px_rgba(62,45,25,0.07)]">
    <header className="relative overflow-hidden border-b border-[#EEE5D7] bg-gradient-to-br from-[#FFFCF7] via-white to-[#F7EEDC] px-4 py-5 sm:px-6 sm:py-6">
      <div aria-hidden="true" className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full border-[18px] border-[#D7BE8B]/15" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8C39B] bg-white/90 text-[#9A773F] shadow-sm"><Users size={19}/></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A17E46]">Tu evento · organización</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#332B27]">Lista de invitados</h2><p className="mt-1 text-sm text-[#7D7467]">{guests.length ? `${guests.length} invitaciones · ${passCount} pases` : "Agrega invitados y lleva el control de sus respuestas"}</p></div>
        </div>
        <div className="relative flex items-center gap-2">
          <button type="button" onClick={() => showTools ? closeGuestTools() : setShowTools(true)} disabled={importing} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#A88249] bg-[#A88249] px-4 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(168,130,73,0.22)] transition hover:bg-[#92703E] disabled:cursor-not-allowed disabled:opacity-60">{showTools ? <X size={17}/> : <Plus size={17}/ >}{showTools ? "Cerrar" : "Agregar invitados"}</button>
          <button type="button" onClick={() => { setLoading(true); void loadGuests(); }} disabled={loading} aria-label="Actualizar lista de invitados" title="Actualizar lista" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#E7DCC8] bg-white/90 p-3 text-[#5C554B] transition hover:border-[#C9AD7B] hover:bg-white disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/></button>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-2 gap-2 border-b border-[#EEE5D7] bg-[#FFFCF7] p-3 sm:grid-cols-4 sm:gap-3 sm:px-6 sm:py-4">
      <div className="rounded-2xl border border-[#E8DECF] bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-lg font-semibold tabular-nums text-[#332B27] sm:text-xl">{guests.length}</p><p className="mt-1 text-[10px] leading-tight text-[#7D7467] sm:text-xs">Invitaciones</p></div>
      <div className="rounded-2xl border border-[#E8DECF] bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-lg font-semibold tabular-nums text-[#98702F] sm:text-xl">{passCount}</p><p className="mt-1 text-[10px] leading-tight text-[#7D7467] sm:text-xs">Pases asignados</p></div>
      <div className="rounded-2xl border border-[#DCE9DE] bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-lg font-semibold tabular-nums text-[#356B4B] sm:text-xl">{confirmedPassCount}</p><p className="mt-1 text-[10px] leading-tight text-[#6F786D] sm:text-xs">Personas que asistirán</p></div>
      <div className="rounded-2xl border border-[#F0E2C4] bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-lg font-semibold tabular-nums text-[#98702F] sm:text-xl">{pendingRsvpCount}</p><p className="mt-1 text-[10px] leading-tight text-[#8A7860] sm:text-xs">Por responder</p></div>
    </div>
    <p className="border-b border-[#EEE5D7] px-4 py-3 text-xs leading-5 text-[#7D7467] sm:px-6">Cada invitación puede incluir varios pases. Los pases incluyen al invitado y sus acompañantes.</p>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEE5D7] bg-white px-4 py-3 sm:px-6"><p className="text-sm text-[#5C554B]"><span className="font-semibold text-[#98702F]">{pendingDeliveryCount}</span> invitaciones pendientes de envío</p><button type="button" onClick={() => { setDeliveryFilter(deliveryFilter === "pending" ? "all" : "pending"); setPage(1); }} className="rounded-lg border border-[#D8C39B] px-3 py-2 text-xs font-semibold text-[#8E6D3D] transition hover:bg-[#FFFCF7]">{deliveryFilter === "pending" ? "Ver todas las invitaciones" : "Ver pendientes de envío"}</button></div>

    {showTools && <div id="guest-tools-form" className="scroll-mt-6 border-b border-[#EEE5D7] bg-[#FFFCF7] p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold text-[#332B27]">{editing ? "Editar invitación" : "Agregar una invitación"}</h3><p className="mt-1 text-sm text-[#7D7467]">Agrega el nombre y WhatsApp. Si invitas a una familia o pareja, puedes agruparla y asignar sus pases.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input label="Nombre" value={draft.name} onChange={v => setDraft(d => ({...d,name:v}))} placeholder="Nombre completo"/>
            <div className="block text-sm font-medium text-[#4E463D]">
              WhatsApp del invitado
              <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2">
                <select aria-label="Lada internacional" value={draft.countryCode} onChange={e => setDraft(d => ({...d,countryCode:e.target.value}))} className="min-w-0 rounded-xl border border-[#E7DCC8] bg-white px-2.5 py-3 text-sm outline-none focus:border-[#A88249]">
                  {countryCodes.map(item => <option key={item.code} value={item.code}>{item.iso} (+{item.code})</option>)}
                </select>
                <input aria-label="Teléfono de 10 dígitos" type="tel" inputMode="numeric" autoComplete="tel-national" value={draft.phone} onChange={e => setDraft(d => ({...d,phone:e.target.value.replace(/\D/g, "").slice(0,10)}))} placeholder="10 dígitos" maxLength={10} pattern="[0-9]{10}" className="min-w-0 w-full rounded-xl border border-[#E7DCC8] bg-white px-3 py-3 text-sm outline-none focus:border-[#A88249]"/>
              </div>
              <p className="mt-1 text-[11px] font-normal text-[#8A7860]">{countryCodes.find(item => item.code === draft.countryCode)?.name ?? "País seleccionado"} · lada +{draft.countryCode}</p>
            </div>
            <Input label="Grupo familiar (opcional)" value={draft.group} onChange={v => setDraft(d => ({...d,group:v}))} placeholder="Ej. Familia López"/>
            <div className="block text-sm font-medium text-[#4E463D]">
              Pases
              <div className="mt-1.5 flex h-[43px] w-full items-center rounded-xl border border-[#E7DCC8] bg-white">
                <button type="button" onClick={() => setDraft(d => ({...d,passes:Math.max(1,d.passes-1)}))} disabled={draft.passes <= 1} aria-label="Quitar un pase" className="flex h-full w-11 shrink-0 items-center justify-center rounded-l-xl text-[#8E6D3D] transition hover:bg-[#F8F2E8] disabled:opacity-35"><Minus size={15}/></button>
                <input aria-label="Número de pases" type="number" inputMode="numeric" min={1} max={99} step={1} value={draft.passes} onChange={e => { const value = e.target.value; setDraft(d => ({...d,passes:value === "" ? 1 : Math.min(99,Math.max(1,Math.trunc(Number(value) || 1)))})); }} className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-sm font-semibold tabular-nums text-[#332B27] outline-none focus:ring-0"/>
                <button type="button" onClick={() => setDraft(d => ({...d,passes:Math.min(99,d.passes+1)}))} disabled={draft.passes >= 99} aria-label="Agregar un pase" className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-xl text-[#8E6D3D] transition hover:bg-[#F8F2E8] disabled:opacity-35"><Plus size={15}/></button>
              </div>
              <p className="mt-1 text-[11px] font-normal text-[#8A7860]">Incluye al invitado y sus acompañantes.</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => void saveGuest()} disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#A88249] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar invitado"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setDraft(emptyDraft);}} className="rounded-lg border px-3" aria-label="Cancelar edición"><X size={16}/></button>}</div>
        </div>
        <div className="border-t border-[#E7DCC8] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h3 className="font-semibold text-[#332B27]">¿Tienes tu lista en un archivo?</h3><p className="mt-1 text-sm text-[#7D7467]">Sube tu Excel o CSV y revisa los datos antes de agregarlos.</p><p className="mt-2 text-xs leading-5 text-[#8A7860]">Usa una fila por invitación: Nombre, Teléfono, Grupo familiar (opcional) y Pases.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={downloadTemplate} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#8E6D3D] hover:bg-[#F8F2E8]"><Download size={17}/> Descargar plantilla de ejemplo</button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => void handleFile(e.target.files?.[0])}/>
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-[#CDBB9D] px-3 py-2 text-sm font-semibold text-[#5C554B] hover:bg-[#F8F2E8]"><Upload size={17}/> Subir archivo Excel o CSV</button>
          </div>
        </div>
      </div>
    </div>}

    <div className="space-y-3 p-3 sm:p-4">
      {importRows.length > 0 ? <div className="rounded-xl border border-[#E7DCC8] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-[#332B27]">Revisa tu lista antes de agregarla</h3><p className="mt-1 text-sm text-[#7D7467]">{importRows.filter(r=>!r.error).length} invitaciones listas · {importRows.filter(r=>r.error).length} por corregir</p><p className="mt-1 text-xs text-[#8A7860]">Se agregarán las filas correctas. Revisa las que tengan avisos.</p></div><button type="button" onClick={closeGuestTools} disabled={importing} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#E7DCC8] px-3 py-2 text-sm font-semibold text-[#5C554B] hover:bg-[#FFFCF7] disabled:opacity-50"><X size={16}/> Volver a la lista</button></div>
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#F8F2E8]"><tr><th className="p-2">Nombre</th><th className="p-2">Teléfono</th><th className="p-2">Grupo</th><th className="p-2">Pases</th><th className="p-2">Revisión</th></tr></thead><tbody>{importRows.map(r=><tr key={r.row} className="border-t"><td className="p-2">{r.name || "—"}</td><td className="p-2">{r.phone || "—"}</td><td className="p-2">{r.group || "—"}</td><td className="p-2">{r.passes}</td><td className={r.error?"p-2 text-red-700":"p-2 text-green-700"}>{r.error || "Correcto"}</td></tr>)}</tbody></table></div>
        <button type="button" onClick={() => void importValidRows()} disabled={importing || !importRows.some(r=>!r.error)} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A88249] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><FileSpreadsheet size={16}/>{importing ? "Agregando..." : `Agregar ${importRows.filter(r=>!r.error).length} invitaciones`}</button>
      </div> : <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8E7C]"/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Buscar invitado o teléfono" className="w-full rounded-xl border border-[#E7DCC8] bg-white py-3 pl-9 pr-3 text-sm outline-none transition focus:border-[#A88249] focus:ring-2 focus:ring-[#A88249]/10"/></label>
          <select value={rsvpFilter} onChange={e=>{setRsvpFilter(e.target.value);setPage(1);}} aria-label="Filtrar confirmación de asistencia" className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#A88249] focus:ring-2 focus:ring-[#A88249]/10"><option value="all">Todas las respuestas</option><option value="pending">Por responder</option><option value="attending">Confirmaron</option><option value="declined">No asistirán</option></select>
          <select value={deliveryFilter} onChange={e=>{setDeliveryFilter(e.target.value);setPage(1);}} aria-label="Filtrar estado de envío" className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#A88249] focus:ring-2 focus:ring-[#A88249]/10"><option value="all">Todos los envíos</option><option value="pending">Envío pendiente</option><option value="sent">Enviada (marcada)</option></select>
        </div>
        {loading ? <p className="py-10 text-center text-sm text-[#7D7467]">Cargando invitados...</p> : loadError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center"><p className="font-medium text-red-800">No pudimos cargar la lista de invitados.</p><p className="mt-1 text-sm text-red-700">Revisa tu conexión e inténtalo de nuevo.</p><button type="button" onClick={() => void loadGuests()} className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800">Volver a intentar</button></div> : filtered.length === 0 ? <div className="rounded-xl border border-dashed border-[#E7DCC8] px-4 py-10 text-center"><Users className="mx-auto text-[#A88249]" size={26}/><p className="mt-3 font-medium text-[#332B27]">{guests.length ? "No encontramos invitados" : "Aún no hay invitados"}</p><p className="mt-1 text-sm text-[#7D7467]">{guests.length ? "Prueba con otro nombre o filtro." : "Agrega invitados o sube tu lista desde un archivo."}</p></div> :
          <div className="overflow-hidden rounded-2xl border border-[#E8DECF] bg-white shadow-sm">
            {visibleGuests.map(g=><div key={g.guest_id} className="flex flex-col gap-3 border-b border-[#F0E9DF] px-3 py-4 transition-colors last:border-b-0 hover:bg-[#FFFCF7] sm:flex-row sm:items-center sm:gap-3 sm:px-4">
              <div className="flex min-w-0 w-full items-start justify-between gap-3 sm:flex-1"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#332B27]" title={g.guest_name}>{g.guest_name}</p><p className="mt-0.5 truncate text-xs text-[#7D7467]" title={[g.family_group,g.passes===1?"1 pase":`${g.passes} pases`].filter(Boolean).join(" · ")}>{g.family_group ? `${g.family_group} · ` : ""}{g.passes} {g.passes===1?"pase":"pases"}</p></div>
              <div className="flex min-w-0 shrink-0 flex-col items-end gap-1"><span className={g.attendance_status==="attending"?"rounded-md bg-green-50 px-2 py-1 text-[11px] font-medium text-green-800":g.attendance_status==="declined"?"rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700":"rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800"}>{g.attendance_status==="attending"?`Confirmó · ${g.party_size ?? 1}`:g.attendance_status==="declined"?"No asistirá":"Por responder"}</span><span className={g.delivery_status==="sent"?"rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-800":"rounded-md bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-800"}>{g.delivery_status==="sent"?"Envío marcado":"Sin enviar"}</span></div></div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
                <button type="button" onClick={()=>void copyPersonalLink(g)} title="Copiar enlace personalizado" aria-label={`Copiar enlace personalizado de ${g.guest_name}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E7DCC8] bg-white px-2 py-2 text-xs font-semibold text-[#8E6D3D] transition-colors hover:bg-[#F8F2E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88249]/30 sm:flex-none sm:px-3"><Copy size={17}/>Copiar enlace</button>
                <button type="button" onClick={()=>void openWhatsApp(g)} title="Preparar mensaje en WhatsApp" aria-label={`Preparar invitación de ${g.guest_name} en WhatsApp`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/30 sm:flex-none sm:px-3"><MessageCircle size={17}/>WhatsApp</button>
                <button type="button" onClick={()=>setExpandedActions(expandedActions===g.guest_id?null:g.guest_id)} aria-expanded={expandedActions===g.guest_id} aria-label={`Más opciones para ${g.guest_name}`} className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-[#E7DCC8] px-3 py-2 text-xs font-semibold text-[#6E5A3F] hover:bg-[#F8F2E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88249]/30 sm:w-auto sm:border-0">{expandedActions===g.guest_id?"Ocultar opciones":"Más opciones"}</button>
                {expandedActions===g.guest_id && <div className="flex w-full flex-wrap justify-start gap-1.5 sm:justify-end">
                  <button type="button" onClick={()=>void setDeliveryStatus(g, g.delivery_status === "sent" ? "pending" : "sent")} title={g.delivery_status==="sent"?"Marcar como pendiente":"Marcar envío como realizado"} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E7DCC8] px-3 py-2 text-xs font-medium text-[#5C554B] hover:bg-[#F8F2E8]"><CheckCircle2 size={17}/>{g.delivery_status==="sent"?"Marcar pendiente":"Marcar enviada"}</button>
                  <button type="button" onClick={()=>startEdit(g)} title="Editar" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E7DCC8] px-3 py-2 text-xs font-medium text-[#5C554B] hover:bg-[#F8F2E8]"><Edit2 size={17}/>Editar</button>
                  <button type="button" onClick={()=>void removeGuest(g)} title="Eliminar" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 size={17}/>Eliminar</button>
                </div>}
              </div>
            </div>)}
          </div>}
        {!loading && filtered.length > 0 && <div className="flex items-center justify-between gap-3 border-t border-[#EEE5D7] pt-3 text-xs text-[#7D7467]"><span>{(page-1)*pageSize+1}–{Math.min(page*pageSize,filtered.length)} de {filtered.length}</span><div className="flex items-center gap-2"><button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} aria-label="Página anterior" className="rounded-md border border-[#E7DCC8] p-2 disabled:opacity-40"><ChevronLeft size={15}/></button><span>{Math.min(page,pageCount)} / {pageCount}</span><button type="button" onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page>=pageCount} aria-label="Página siguiente" className="rounded-md border border-[#E7DCC8] p-2 disabled:opacity-40"><ChevronRight size={15}/></button></div></div>}
      </>}
    </div>
  </section>;
}
function Input({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:"text"|"tel"}) {
  return <label className="block text-sm font-medium text-[#4E463D]">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={120} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#A88249]"/></label>;
}
