"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { Check, Download, Edit2, FileSpreadsheet, MessageCircle, Plus, RefreshCw, Save, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Guest = { guest_id: string; guest_name: string; phone: string; family_group: string; passes: number; delivery_status: "pending" | "sent"; sent_at: string | null; created_at: string };
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
  const [groupFilter, setGroupFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadGuests = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_invitation_guests_with_token", { p_event_id: eventId, p_organizer_token: organizerToken });
    if (error) { console.error(error); toast.error("No fue posible cargar la lista de invitados."); }
    else setGuests((data ?? []) as Guest[]);
    setLoading(false);
  }, [eventId, organizerToken]);
  useEffect(() => { void loadGuests(); }, [loadGuests]);

  const groups = useMemo(() => Array.from(new Set(guests.map(g => g.family_group.trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b, "es")), [guests]);
  const filtered = useMemo(() => guests.filter(g => {
    const textMatch = [g.guest_name, g.phone, g.family_group].some(v => v.toLowerCase().includes(query.toLowerCase()));
    return textMatch && (groupFilter === "all" || g.family_group === groupFilter);
  }), [guests, query, groupFilter]);
  const pendingCount = guests.filter(g => g.delivery_status === "pending").length;
  const passCount = guests.reduce((sum, g) => sum + g.passes, 0);

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
  function startEdit(g: Guest) { setEditing(g.guest_id); setDraft({ name: g.guest_name, phone: g.phone, group: g.family_group, passes: g.passes }); }
  async function setStatus(g: Guest, status: "pending" | "sent") {
    const { error } = await supabase.rpc("set_invitation_guest_delivery_status", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id, p_status: status });
    if (error) toast.error("No se pudo actualizar el estado."); else { toast.success(status === "sent" ? "Marcado como enviado." : "Marcado como pendiente."); await loadGuests(); }
  }
  async function removeGuest(g: Guest) {
    if (!window.confirm(`¿Eliminar a ${g.guest_name} de la lista?`)) return;
    const { error } = await supabase.rpc("delete_invitation_guest_with_token", { p_event_id: eventId, p_organizer_token: organizerToken, p_guest_id: g.guest_id });
    if (error) toast.error("No se pudo eliminar el invitado."); else { toast.success("Invitado eliminado."); await loadGuests(); }
  }
  function openWhatsApp(g: Guest) {
    if (!invitationSlug) { toast.error("Primero guarda la invitación para generar su enlace."); return; }
    const link = `${window.location.origin}/i/${invitationSlug}`;
    const message = `¡Hola ${g.guest_name}! 💛 Nos encantará compartir este momento contigo. Aquí puedes ver la invitación y los detalles del evento: ${link} Te reservamos ${g.passes} ${g.passes === 1 ? "pase" : "pases"}. ¡Esperamos verte!`;
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

  return <section className="mt-6 overflow-hidden rounded-3xl border border-[#E7DCC8] bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE5D7] px-5 py-5 sm:px-7">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A88249]">Organización del evento</p><h2 className="mt-1 text-2xl font-semibold text-[#332B27]">Centro de invitados</h2><p className="mt-1 text-sm text-[#7D7467]">Organiza familias, asigna pases y comparte la invitación por WhatsApp.</p></div>
      <button type="button" onClick={() => { setLoading(true); void loadGuests(); }} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm text-[#5C554B] disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/> Actualizar</button>
    </header>
    <div className="grid grid-cols-3 gap-2 p-4 sm:gap-3 sm:px-7"><Stat label="Invitados" value={guests.length}/><Stat label="Pases reservados" value={passCount}/><Stat label="Pendientes de envío" value={pendingCount}/></div>
    <div className="grid gap-5 px-4 pb-5 sm:px-7 sm:pb-7 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
      <div className="rounded-2xl border border-[#EEE5D7] bg-[#FFFCF7] p-4 sm:p-5">
        <h3 className="font-semibold text-[#332B27]">{editing ? "Editar invitado" : "Agregar invitado"}</h3>
        <div className="mt-4 space-y-3">
          <Input label="Nombre completo" value={draft.name} onChange={v => setDraft(d => ({...d,name:v}))} placeholder="Nombre del invitado"/>
          <Input label="Teléfono / WhatsApp" value={draft.phone} onChange={v => setDraft(d => ({...d,phone:v}))} placeholder="Ej. 8112345678" type="tel"/>
          <Input label="Grupo familiar (opcional)" value={draft.group} onChange={v => setDraft(d => ({...d,group:v}))} placeholder="Familia López"/>
          <label className="block text-sm font-medium text-[#4E463D]">Pases asignados<input type="number" min={1} max={20} value={draft.passes} onChange={e => setDraft(d => ({...d,passes:Math.max(1,Math.min(20,Number(e.target.value)||1))}))} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#A88249]"/></label>
          <div className="flex gap-2 pt-1"><button type="button" onClick={() => void saveGuest()} disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#A88249] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar invitado"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setDraft(emptyDraft);}} className="rounded-full border px-3" aria-label="Cancelar edición"><X size={16}/></button>}</div>
        </div>
        <div className="mt-6 border-t border-[#E7DCC8] pt-5">
          <h3 className="font-semibold text-[#332B27]">Importar invitados</h3><p className="mt-1 text-xs leading-5 text-[#7D7467]">Excel (.xlsx) o CSV. Columnas: Nombre, Teléfono, Grupo familiar y Pases. Revisarás los datos antes de guardarlos.</p>
          <button type="button" onClick={downloadTemplate} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#8E6D3D]"><Download size={15}/> Descargar plantilla CSV</button>
          <input ref={fileRef} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => void handleFile(e.target.files?.[0])}/>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#CDBB9D] px-4 py-3 text-sm font-medium text-[#5C554B] hover:bg-[#F8F2E8]"><Upload size={16}/> Elegir archivo Excel o CSV</button>
        </div>
      </div>
      <div className="min-w-0">
        {importRows.length > 0 ? <div className="rounded-2xl border border-[#E7DCC8] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-[#332B27]">Vista previa de importación</h3><p className="mt-1 text-sm text-[#7D7467]">{importRows.filter(r=>!r.error).length} válidos · {importRows.filter(r=>r.error).length} con errores</p></div><button type="button" onClick={() => setImportRows([])} className="text-sm text-[#7D7467]">Cancelar</button></div>
          <div className="mt-3 max-h-72 overflow-auto rounded-xl border"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#F8F2E8]"><tr><th className="p-2">Nombre</th><th className="p-2">Teléfono</th><th className="p-2">Grupo</th><th className="p-2">Pases</th><th className="p-2">Validación</th></tr></thead><tbody>{importRows.map(r=><tr key={r.row} className="border-t"><td className="p-2">{r.name || "—"}</td><td className="p-2">{r.phone || "—"}</td><td className="p-2">{r.group || "—"}</td><td className="p-2">{r.passes}</td><td className={r.error?"p-2 text-red-700":"p-2 text-green-700"}>{r.error || "Listo"}</td></tr>)}</tbody></table></div>
          <button type="button" onClick={() => void importValidRows()} disabled={importing || !importRows.some(r=>!r.error)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#A88249] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><FileSpreadsheet size={16}/>{importing ? "Importando..." : `Importar ${importRows.filter(r=>!r.error).length} invitados válidos`}</button>
        </div> : <>
          <div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono o familia" className="min-w-0 flex-1 rounded-xl border border-[#E7DCC8] px-3.5 py-3 text-sm outline-none focus:border-[#A88249]"/><select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)} className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-3 text-sm"><option value="all">Todas las familias</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
          {loading ? <p className="py-10 text-center text-sm text-[#7D7467]">Cargando invitados...</p> : filtered.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-[#E7DCC8] px-4 py-10 text-center"><Users className="mx-auto text-[#A88249]" size={28}/><p className="mt-3 font-medium text-[#332B27]">{guests.length ? "No hay resultados" : "Tu lista de invitados está vacía"}</p><p className="mt-1 text-sm text-[#7D7467]">Agrega personas manualmente o importa un archivo.</p></div> :
            <div className="mt-4 space-y-3">{filtered.map(g=><article key={g.guest_id} className="rounded-2xl border border-[#EEE5D7] p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold text-[#332B27]">{g.guest_name}</p><p className="mt-1 text-sm text-[#7D7467]">{g.phone}</p>{g.family_group && <p className="mt-1 inline-flex rounded-full bg-[#F8F2E8] px-2.5 py-1 text-xs text-[#6E5A3F]">{g.family_group}</p>}</div><div className="shrink-0 text-right"><p className="text-sm font-semibold text-[#332B27]">{g.passes} {g.passes===1?"pase":"pases"}</p><span className={g.delivery_status==="sent"?"mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800":"mt-1 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800"}>{g.delivery_status==="sent"?"Enviado":"Pendiente"}</span></div></div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[#F1E9DC] pt-3">
                <button type="button" onClick={()=>openWhatsApp(g)} className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7EE] px-3 py-2 text-xs font-semibold text-[#17683A]"><MessageCircle size={14}/> Abrir WhatsApp</button>
                <button type="button" onClick={()=>void setStatus(g,g.delivery_status==="sent"?"pending":"sent")} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium text-[#5C554B]">{g.delivery_status==="sent"?<RefreshCw size={13}/>:<Check size={13}/>} {g.delivery_status==="sent"?"Marcar pendiente":"Marcar enviado"}</button>
                <button type="button" onClick={()=>startEdit(g)} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs text-[#5C554B]"><Edit2 size={13}/> Editar</button>
                <button type="button" onClick={()=>void removeGuest(g)} className="inline-flex items-center gap-1.5 rounded-full border border-red-100 px-3 py-2 text-xs text-red-700"><Trash2 size={13}/> Eliminar</button>
              </div>
            </article>)}</div>}
        </>}
      </div>
    </div>
  </section>;
}
function Input({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:"text"|"tel"}) {
  return <label className="block text-sm font-medium text-[#4E463D]">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={120} className="mt-1.5 w-full rounded-xl border border-[#E7DCC8] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#A88249]"/></label>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="rounded-2xl bg-[#FFFCF7] p-3 sm:p-4"><p className="text-xs text-[#7D7467] sm:text-sm">{label}</p><p className="mt-1 text-2xl font-semibold text-[#332B27]">{value}</p></div>; }
