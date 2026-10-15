"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { ChevronLeft, ChevronRight, Download, Edit2, FileSpreadsheet, MessageCircle, Plus, RefreshCw, Save, Search, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Guest = { guest_id: string; guest_name: string; phone: string; family_group: string; passes: number; delivery_status: "pending" | "sent"; sent_at: string | null; created_at: string; attendance_status: "attending" | "declined" | null; party_size: number | null; rsvp_updated_at: string | null };
type Draft = { name: string; phone: string; group: string; passes: number };
type ImportRow = Draft & { row: number; error?: string };
const emptyDraft: Draft = { name: "", phone: "", group: "", passes: 1 };
const normalizePhone = (v: string) => v.replace(/\D/g, "");
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
    else if (normalizePhone(phone).length < 7 || normalizePhone(phone).length > 15) error = "Teléfono inválido";
    else if (!Number.isInteger(parsedPasses) || parsedPasses < 1 || parsedPasses > 20) error = "Pases: usa un número de 1 a 20";
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
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [showTools, setShowTools] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadGuests = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_invitation_guests_with_rsvp_token", { p_event_id: eventId, p_organizer_token: organizerToken });
    if (error) { console.error(error); toast.error("No fue posible cargar la lista de invitados."); }
    else setGuests((data ?? []) as Guest[]);
    setLoading(false);
  }, [eventId, organizerToken]);
  // Initial data fetch: state updates happen after the asynchronous Supabase request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadGuests(); }, [loadGuests]);

  const filtered = useMemo(() => guests.filter(g => {
    const q = query.trim().toLocaleLowerCase("es");
    const textMatch = !q || [g.guest_name, g.phone, g.family_group].some(v => v.toLocaleLowerCase("es").includes(q));
    const statusMatch = rsvpFilter === "all" || (rsvpFilter === "pending" ? !g.attendance_status : g.attendance_status === rsvpFilter);
    return textMatch && statusMatch;
  }), [guests, query, rsvpFilter]);
  const passCount = guests.reduce((sum, g) => sum + g.passes, 0);
  const confirmedCount = guests.filter(g => g.attendance_status === "attending").length;
  const pendingRsvpCount = guests.filter(g => !g.attendance_status).length;
  const declinedCount = guests.filter(g => g.attendance_status === "declined").length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleGuests = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function saveGuest() {
    if (!draft.name.trim() || normalizePhone(draft.phone).length < 7) { toast.error("Agrega el nombre y un teléfono válido."); return; }
    setSaving(true);
    const { error } = await supabase.rpc("save_invitation_guest_with_token", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: editing,
      p_name: draft.name.trim(), p_phone: draft.phone.trim(), p_family_group: draft.group.trim(), p_passes: Number(draft.passes),
    });
    setSaving(false);
    if (error) { toast.error(error.message.includes("Ya existe") ? "Ya existe un invitado con ese teléfono." : error.message || "No fue posible guardar."); return; }
    toast.success(editing ? "Invitado actualizado." : "Invitado agregado.");
    setDraft(emptyDraft); setEditing(null); await loadGuests();
  }
  function startEdit(g: Guest) { setEditing(g.guest_id); setDraft({ name: g.guest_name, phone: g.phone, group: g.family_group, passes: g.passes }); setShowTools(true); requestAnimationFrame(() => document.getElementById("guest-tools-form")?.scrollIntoView({ behavior: "smooth", block: "start" })); }

  async function removeGuest(g: Guest) {
    if (!window.confirm(`¿Eliminar a ${g.guest_name} de la lista?`)) return;
    const { error } = await supabase.rpc("delete_invitation_guest_with_token", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id });
    if (error) toast.error("No se pudo eliminar el invitado."); else { toast.success("Invitado eliminado."); await loadGuests(); }
  }
  async function openWhatsApp(g: Guest) {
    if (!invitationSlug) { toast.error("Primero guarda y publica la invitación para generar su enlace."); return; }
    const { data, error } = await supabase.rpc("get_or_create_invitation_guest_link", {
      p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id,
    });
    const personalToken = data?.[0]?.guest_token ?? data?.guest_token;
    if (error || typeof personalToken !== "string" || !personalToken) {
      toast.error("No fue posible generar el enlace personalizado. Inténtalo de nuevo.");
      return;
    }
    const link = new URL(`/i/${invitationSlug}`, window.location.origin);
    link.searchParams.set("invitado", personalToken);
    const message = `¡Hola ${g.guest_name}! Nos encantará compartir este momento contigo. Aquí puedes ver la invitación y los detalles del evento: ${link.toString()} Te reservamos ${g.passes} ${g.passes === 1 ? "pase" : "pases"}. ¡Esperamos verte!`;
    window.open(`https://wa.me/${normalizePhone(g.phone)}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
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
        if (!error && seen.has(phone)) error = "Teléfono duplicado en el archivo";
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
      const { error } = await supabase.rpc("save_invitation_guest_with_token", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: null, p_name: row.name, p_phone: row.phone, p_family_group: row.group, p_passes: row.passes });
      if (error) failures.push(`Fila ${row.row}: ${error.message}`); else count++;
    }
    setImporting(false); setImportRows([]); await loadGuests();
    if (failures.length) toast.error(`Se importaron ${count}; ${failures.length} no se pudieron guardar. Revisa duplicados.`);
    else toast.success(`Se importaron ${count} invitados.`);
  }

  return <section className="mt-5 overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE5D7] px-4 py-4 sm:px-5">
      <div><h2 className="text-lg font-semibold text-[#332B27]">Lista de invitados</h2><p className="mt-0.5 text-sm text-[#7D7467]">{guests.length ? `${guests.length} invitados · ${passCount} pases` : "Agrega a las personas que quieres invitar"}</p></div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setShowTools(v => !v)} className="inline-flex items-center gap-2 rounded-lg bg-[#A88249] px-3.5 py-2.5 text-sm font-semibold text-white"><Plus size={16}/>{showTools ? "Cerrar" : "Agregar invitados"}</button>
        <button type="button" onClick={() => { setLoading(true); void loadGuests(); }} disabled={loading} aria-label="Actualizar lista" title="Actualizar" className="rounded-lg border border-[#E7DCC8] p-2.5 text-[#5C554B] disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/></button>
      </div>
    </header>

    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#EEE5D7] bg-[#FFFCF7] px-4 py-3 text-sm sm:px-5">
      <span className="font-medium text-green-800">{confirmedCount} confirmaron</span><span className="text-[#8A6A32]">{pendingRsvpCount} por responder</span>{declinedCount > 0 && <span className="text-[#7D7467]">{declinedCount} no asistirán</span>}
    </div>

    {showTools && <div id="guest-tools-form" className="scroll-mt-6 border-b border-[#EEE5D7] bg-[#FFFCF7] p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold text-[#332B27]">{editing ? "Editar invitado" : "Agregar una persona"}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input label="Nombre" value={draft.name} onChange={v => setDraft(d => ({...d,name:v}))} placeholder="Nombre completo"/>
            <Input label="Teléfono para WhatsApp" value={draft.phone} onChange={v => setDraft(d => ({...d,phone:v}))} placeholder="Ej. 8112345678" type="tel"/>
            <Input label="Familia o grupo (opcional)" value={draft.group} onChange={v => setDraft(d => ({...d,group:v}))} placeholder="Familia López"/>
            <label className="block text-sm font-medium text-[#4E463D]">¿Cuántos pases?<input type="number" min={1} max={20} value={draft.passes} onChange={e => setDraft(d => ({...d,passes:Math.max(1,Math.min(20,Number(e.target.value)||1))}))} className="mt-1.5 w-full rounded-lg border border-[#E7DCC8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A88249]"/></label>
          </div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => void saveGuest()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A88249] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Guardar invitado"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setDraft(emptyDraft);}} className="rounded-lg border px-3" aria-label="Cancelar edición"><X size={16}/></button>}</div>
        </div>
        <div className="border-t border-[#E7DCC8] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h3 className="font-semibold text-[#332B27]">¿Ya tienes una lista?</h3><p className="mt-1 text-sm text-[#7D7467]">Puedes cargarla desde Excel o CSV. Revisarás los datos antes de guardarlos.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 text-sm font-medium text-[#8E6D3D]"><Download size={15}/> Descargar ejemplo</button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => void handleFile(e.target.files?.[0])}/>
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#CDBB9D] px-3 py-2 text-sm font-medium text-[#5C554B] hover:bg-[#F8F2E8]"><Upload size={15}/> Elegir archivo</button>
          </div>
        </div>
      </div>
    </div>}

    <div className="space-y-3 p-3 sm:p-4">
      {importRows.length > 0 ? <div className="rounded-xl border border-[#E7DCC8] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-[#332B27]">Revisar lista</h3><p className="mt-1 text-sm text-[#7D7467]">{importRows.filter(r=>!r.error).length} listos para agregar · {importRows.filter(r=>r.error).length} por corregir</p></div><button type="button" onClick={() => setImportRows([])} className="text-sm text-[#7D7467]">Cancelar</button></div>
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#F8F2E8]"><tr><th className="p-2">Nombre</th><th className="p-2">Teléfono</th><th className="p-2">Grupo</th><th className="p-2">Pases</th><th className="p-2">Revisión</th></tr></thead><tbody>{importRows.map(r=><tr key={r.row} className="border-t"><td className="p-2">{r.name || "—"}</td><td className="p-2">{r.phone || "—"}</td><td className="p-2">{r.group || "—"}</td><td className="p-2">{r.passes}</td><td className={r.error?"p-2 text-red-700":"p-2 text-green-700"}>{r.error || "Correcto"}</td></tr>)}</tbody></table></div>
        <button type="button" onClick={() => void importValidRows()} disabled={importing || !importRows.some(r=>!r.error)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#A88249] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><FileSpreadsheet size={16}/>{importing ? "Agregando..." : `Agregar ${importRows.filter(r=>!r.error).length} invitados`}</button>
      </div> : <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8E7C]"/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Buscar por nombre o teléfono" className="w-full rounded-lg border border-[#E7DCC8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#A88249]"/></label>
          <select value={rsvpFilter} onChange={e=>{setRsvpFilter(e.target.value);setPage(1);}} aria-label="Filtrar invitados" className="rounded-lg border border-[#E7DCC8] bg-white px-3 py-2.5 text-sm"><option value="all">Todos</option><option value="pending">Por responder</option><option value="attending">Confirmaron</option><option value="declined">No asistirán</option></select>
        </div>
        {loading ? <p className="py-10 text-center text-sm text-[#7D7467]">Cargando invitados...</p> : filtered.length === 0 ? <div className="rounded-xl border border-dashed border-[#E7DCC8] px-4 py-10 text-center"><Users className="mx-auto text-[#A88249]" size={26}/><p className="mt-3 font-medium text-[#332B27]">{guests.length ? "No encontramos invitados" : "Tu lista está vacía"}</p><p className="mt-1 text-sm text-[#7D7467]">{guests.length ? "Prueba con otro nombre o filtro." : "Agrega a tus invitados o carga una lista que ya tengas."}</p></div> :
          <div className="overflow-hidden rounded-xl border border-[#EEE5D7]">
            {visibleGuests.map(g=><div key={g.guest_id} className="flex items-center gap-3 border-b border-[#F0E9DF] px-3 py-3 last:border-b-0 hover:bg-[#FFFCF7] sm:px-4">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#332B27]" title={g.guest_name}>{g.guest_name}</p><p className="mt-0.5 truncate text-xs text-[#7D7467]" title={[g.family_group,g.passes===1?"1 pase":`${g.passes} pases`].filter(Boolean).join(" · ")}>{g.family_group ? `${g.family_group} · ` : ""}{g.passes} {g.passes===1?"pase":"pases"}</p></div>
              <span className={g.attendance_status==="attending"?"shrink-0 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-800":g.attendance_status==="declined"?"shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700":"shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"}>{g.attendance_status==="attending"?`Confirmó · ${g.party_size ?? 1}`:g.attendance_status==="declined"?"No asistirá":"Pendiente"}</span>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={()=>void openWhatsApp(g)} title="Compartir por WhatsApp" aria-label={`Compartir invitación de ${g.guest_name}`} className="rounded-md p-2 text-green-700 hover:bg-green-50"><MessageCircle size={16}/></button>
                <button type="button" onClick={()=>startEdit(g)} title="Editar" aria-label={`Editar ${g.guest_name}`} className="rounded-md p-2 text-[#6E5A3F] hover:bg-[#F8F2E8]"><Edit2 size={15}/></button>
                <button type="button" onClick={()=>void removeGuest(g)} title="Eliminar" aria-label={`Eliminar ${g.guest_name}`} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 size={15}/></button>
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
