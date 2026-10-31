"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Draft = {
  draft_id:string; draft_reference:string; event_type:string; package:string;
  template_key:string; content_config:Record<string,unknown>; event_date:string|null;
  status:string; payment_status:"pending"|"paid"|"rejected"; editing_enabled:boolean;
  whatsapp_confirmation_phone:string|null; shopify_order_name:string|null; created_at:string;
};
type Form = {payment_status:Draft["payment_status"];editing_enabled:boolean;phone:string;order:string};
const eventLabels:Record<string,string>={wedding:"Boda",xv:"XV años",baby_shower:"Baby shower",baptism:"Bautizo",other:"Otro"};
const templateLabels:Record<string,string>={wedding_editorial:"Editorial",xv_gala:"Gala",baby_soft:"Suave",baptism_light:"Luz",botanical:"Botánico",noir:"Noir",pink_atelier:"Pink Atelier",celestial:"Celestial",cloud:"Nube",garden:"Jardín"};

export default function InvitationDraftAdmin(){
 const [drafts,setDrafts]=useState<Draft[]>([]);
 const [forms,setForms]=useState<Record<string,Form>>({});
 const [filter,setFilter]=useState("all");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const applyRows=useCallback((rows:Draft[])=>{
  setDrafts(rows);
  setForms(Object.fromEntries(rows.map(d=>[d.draft_id,{payment_status:d.payment_status,editing_enabled:d.editing_enabled,phone:d.whatsapp_confirmation_phone??"",order:d.shopify_order_name??""}])));
 },[]);
 const load=useCallback(async()=>{
  const {data,error}=await supabase.rpc("admin_list_invitation_drafts");
  setError(error?.message??"");
  if(error)setDrafts([]);else applyRows((data??[]) as Draft[]);
  setLoading(false);
 },[applyRows]);
 useEffect(()=>{
  let active=true;
  supabase.rpc("admin_list_invitation_drafts").then(({data,error})=>{
   if(!active)return;
   setError(error?.message??"");
   if(error)setDrafts([]);else applyRows((data??[]) as Draft[]);
   setLoading(false);
  });
  return ()=>{active=false;};
 },[applyRows]);
 async function save(d:Draft){
  const f=forms[d.draft_id];if(!f)return;
  setBusy(d.draft_id);setError("");setNotice("");
  const {data,error}=await supabase.rpc("admin_update_invitation_draft",{p_draft_id:d.draft_id,p_payment_status:f.payment_status,p_editing_enabled:f.editing_enabled,p_whatsapp_phone:f.phone||null,p_shopify_order_name:f.order||null});
  if(error||data!==true)setError(error?.message??"No se pudieron guardar los cambios.");
  else{setNotice("Se actualizó "+d.draft_reference+".");await load();}
  setBusy("");
 }
 const visible=drafts.filter(d=>filter==="all"||d.payment_status===filter);
 return <main className="min-h-screen bg-[#F7F5F1] text-[#292720]">
  <header className="border-b border-[#E7DCC8] bg-white px-4 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#A88249]">Melissarte Events</p><h1 className="mt-1 text-2xl font-semibold">Borradores de invitaciones</h1><p className="mt-1 text-sm text-[#746A5D]">Validación manual de pagos y autorización de edición.</p></div><Link href="/admin" className="shrink-0 text-sm text-[#80643C] underline">Volver al administrador</Link></div></header>
  <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
   <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7DCC8] bg-white p-4"><p className="text-sm text-[#746A5D]">{visible.length} de {drafts.length} borradores</p><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-[#E7DCC8] bg-white px-3 py-2 text-sm"><option value="all">Todos los pagos</option><option value="pending">Pendientes</option><option value="paid">Pagados</option><option value="rejected">Rechazados</option></select></div>
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
   {loading?<p className="py-10 text-center text-sm text-[#746A5D]">Cargando borradores...</p>:visible.length===0?<div className="rounded-2xl border border-dashed border-[#D9CBB3] bg-white p-10 text-center text-sm text-[#746A5D]">No hay borradores para este filtro.</div>:visible.map(d=>{
    const f=forms[d.draft_id]??{payment_status:d.payment_status,editing_enabled:d.editing_enabled,phone:"",order:""};
    return <article key={d.draft_id} className="space-y-4 rounded-2xl border border-[#E7DCC8] bg-white p-4 shadow-sm sm:p-5">
     <div><p className="text-xs font-semibold tracking-wide text-[#A88249]">{d.draft_reference}</p><h2 className="mt-1 text-lg font-semibold">{String(d.content_config?.headline??"Invitación sin título")}</h2><p className="mt-1 text-xs text-[#746A5D]">{eventLabels[d.event_type]??d.event_type} · {d.package==="plus"?"Plus":"Esencial"} · {templateLabels[d.template_key]??d.template_key}</p><p className="mt-1 text-xs text-[#8A8074]">Creado: {new Date(d.created_at).toLocaleString("es-MX")}</p></div>
     <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Estado del pago<select value={f.payment_status} onChange={e=>setForms(p=>({...p,[d.draft_id]:{...f,payment_status:e.target.value as Draft["payment_status"],editing_enabled:e.target.value==="paid"?f.editing_enabled:false}}))} className="mt-1 block w-full rounded-xl border border-[#E7DCC8] bg-white px-3 py-2.5 text-sm"><option value="pending">Pendiente</option><option value="paid">Pagado · validado manualmente</option><option value="rejected">Rechazado</option></select></label>
      <label className="text-sm font-medium">Pedido de Shopify<input value={f.order} onChange={e=>setForms(p=>({...p,[d.draft_id]:{...f,order:e.target.value}}))} placeholder="#1001" maxLength={80} className="mt-1 block w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm"/></label>
      <label className="text-sm font-medium">WhatsApp de confirmaciones<input value={f.phone} onChange={e=>setForms(p=>({...p,[d.draft_id]:{...f,phone:e.target.value}}))} placeholder="+52..." maxLength={30} className="mt-1 block w-full rounded-xl border border-[#E7DCC8] px-3 py-2.5 text-sm"/></label>
      <label className="flex items-center gap-2 self-end rounded-xl border border-[#E7DCC8] p-3 text-sm"><input type="checkbox" checked={f.editing_enabled} disabled={f.payment_status!=="paid"} onChange={e=>setForms(p=>({...p,[d.draft_id]:{...f,editing_enabled:e.target.checked}}))}/>Habilitar edición del cliente</label>
     </div>
     <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE4D5] pt-3"><p className="text-xs text-[#746A5D]">{d.editing_enabled?"Edición autorizada":d.payment_status==="paid"?"Pago validado; falta habilitar edición":"Edición limitada al borrador inicial"}</p><button disabled={busy===d.draft_id} onClick={()=>void save(d)} className="rounded-full bg-[#263D4B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy===d.draft_id?"Guardando...":"Guardar autorización"}</button></div>
    </article>;
   })}
  </div>
 </main>;
}
