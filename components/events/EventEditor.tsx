"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Camera, MailCheck } from "lucide-react";

import { Event } from "@/types/event";
import { updateEvent, deleteEvent } from "@/lib/events";
import { deleteMessagesByEvent } from "@/lib/messages";
import { deletePhotosByEvent } from "@/lib/photos";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import EventInfoForm from "./EventInfoForm";
import EventCover from "./EventCover";
import EventWelcomeMessage from "./EventWelcomeMessage";
import AdminMessageManager from "./AdminMessageManager";
import AdminPhotoManager from "./AdminPhotoManager";

interface EventStats {
  photoCount: number;
  messageCount: number;
  lastActivityAt: string | null;
}

interface Props {
  event: Event;
  stats: EventStats;
  invitationSection?: ReactNode;
  invitationDangerZoneAction?: ReactNode;
}

export default function EventEditor({ event, stats, invitationSection, invitationDangerZoneAction }: Props) {
  const [values, setValues] = useState(event);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "gallery" | "invitation">("general");

  const router = useRouter();

  async function handleSave() {
    try {
      setSaving(true);

      await updateEvent(values.id, {
        title: values.title,
        event_date: values.event_date,
        type: values.type,
        status: values.status,
        messages_enabled: values.messages_enabled,
        invitation_enabled: values.invitation_enabled,
      });

      toast.success("Cambios guardados.");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmptyGallery() {
    const confirmed = confirm(
      "¿Vaciar esta galería?\n\nSe eliminarán todas las fotografías, pero el evento seguirá existiendo. Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setEmptying(true);
      await deletePhotosByEvent(values.id);
      toast.success("Galería vaciada.");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible vaciar la galería.");
    } finally {
      setEmptying(false);
    }
  }

  async function handleDelete() {
    const confirmed = confirm(
      "¿Eliminar este evento?\n\nSe eliminarán todas las fotografías, mensajes y el evento. Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deletePhotosByEvent(values.id);
      await deleteMessagesByEvent(values.id);
      await deleteEvent(values.id);

      toast.success("Evento eliminado.");
      router.push("/admin");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible eliminar el evento.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div role="tablist" aria-label="Secciones de administración del evento" className="grid min-w-[510px] grid-cols-3 gap-2 sm:min-w-0">
          {[
            { id: "general" as const, label: "Datos generales", detail: "Nombre, fecha y estado", icon: <CalendarDays size={18} /> },
            { id: "gallery" as const, label: "Galería digital", detail: "Diseño, fotos y recuerdos", icon: <Camera size={18} /> },
            { id: "invitation" as const, label: "Invitaciones", detail: "Diseño y confirmaciones", icon: <MailCheck size={18} /> },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`admin-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={selected
                  ? "flex min-h-[88px] min-w-0 items-start gap-3 rounded-2xl border border-[#B99A69] bg-[#F8F0E3] p-3 text-left shadow-sm ring-1 ring-[#B99A69]/20 sm:p-4"
                  : "flex min-h-[88px] min-w-0 items-start gap-3 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-3 text-left transition hover:border-[#CBB38D] hover:bg-white sm:p-4"}
              >
                <span className={selected ? "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#A88249] text-white" : "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6D8] text-[#8E6D3D]"}>
                  {tab.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-5 text-[#332B27]">{tab.label}</span>
                  <span className="mt-1 block text-xs leading-4 text-[#7D7467]">{tab.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section id={`admin-panel-${activeTab}`} role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`} className="min-w-0 space-y-6">
        {activeTab === "general" && (
          <>
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-[#1F1F1F]">Datos generales del evento</h2>
                <p className="mt-1 text-sm text-[#7D7467]">Administra la información principal, los servicios activos y el estado de la galería.</p>
              </div>
              <EventInfoForm values={values} onChange={setValues} onSave={handleSave} saving={saving} />
            </div>
            <details className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#7D403A] [&::-webkit-details-marker]:hidden">
                <AlertTriangle size={17} />
                Zona de riesgo y eliminación
              </summary>
              <p className="mt-3 text-sm text-[#7D7467]">Estas acciones son permanentes. Úsalas solo si estás seguro.</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-[#E7DCC8] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#1F1F1F]">Vaciar galería</h3>
                  <p className="mt-1.5 text-sm text-[#7D7467]">Elimina todas las fotografías y conserva la configuración del evento.</p>
                  <Button type="button" variant="outline" onClick={handleEmptyGallery} disabled={emptying} className="mt-3 h-10 rounded-full border-[#D8C7A8] px-5 text-sm">
                    {emptying ? "Vaciando..." : "Vaciar galería"}
                  </Button>
                </div>
                <div className="rounded-xl border border-[#E7C9C4] bg-[#FFF9F8] p-4">
                  <h3 className="text-sm font-semibold text-[#7D403A]">Eliminar evento</h3>
                  <p className="mt-1.5 text-sm text-[#8B665F]">Elimina permanentemente el evento, sus fotografías y sus mensajes.</p>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting} className="mt-3 h-10 rounded-full px-5 text-sm">
                    {deleting ? "Eliminando..." : "Eliminar evento"}
                  </Button>
                </div>
              </div>
            </details>
          </>
        )}

        {activeTab === "gallery" && (
          <>
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-[#1F1F1F]">Apariencia de la galería</h2>
                <p className="mt-1 text-sm text-[#7D7467]">Personaliza lo que verán tus invitados al abrir la galería.</p>
              </div>
              <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                <EventCover values={values} onChange={setValues} />
                <EventWelcomeMessage values={values} onChange={setValues} />
              </div>
              <div className="mt-4 flex flex-wrap justify-end">
                <Button type="button" onClick={handleSave} disabled={saving} className="h-11 w-full rounded-full bg-[#A88249] px-6 text-sm font-medium text-white hover:bg-[#977640] sm:w-auto">
                  {saving ? "Guardando..." : "Guardar cambios de galería"}
                </Button>
              </div>
            </div>
            <div>
              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#1F1F1F]">Fotos y recuerdos</h2>
                  <span className="rounded-full bg-[#F0E6D8] px-2.5 py-1 text-xs font-medium text-[#76582E]">{stats.photoCount} fotos · {stats.messageCount} recuerdos</span>
                </div>
                <p className="mt-1 text-sm text-[#7D7467]">Revisa o modera el contenido compartido por los invitados.</p>
              </div>
              <div className="space-y-4">
                <AdminPhotoManager eventId={values.id} />
                <AdminMessageManager event={values} />
              </div>
            </div>
          </>
        )}

        {activeTab === "invitation" && (
          invitationSection ? (
            <div className="min-w-0">
              {invitationSection}
              {invitationDangerZoneAction && (
                <div className="mt-5 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-[#7D403A]">Administración de invitación</h3>
                  <p className="mt-1 text-sm text-[#7D7467]">Acciones avanzadas para la invitación y sus confirmaciones.</p>
                  <div className="mt-3">{invitationDangerZoneAction}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9CBB3] bg-[#FDFBF8] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E6D8] text-[#8E6D3D]"><MailCheck size={19} /></span>
                <div>
                  <h2 className="text-base font-semibold text-[#332B27]">Invitación digital desactivada</h2>
                  <p className="mt-1 text-sm leading-6 text-[#7D7467]">Activa «Invitación digital» en Datos generales y guarda los cambios para configurar el diseño, publicar la invitación y administrar las confirmaciones.</p>
                  <button type="button" onClick={() => setActiveTab("general")} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#A88249] px-4 text-sm font-semibold text-white hover:bg-[#977640]">Ir a datos generales</button>
                </div>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
