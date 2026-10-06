"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

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
}

export default function EventEditor({ event, stats }: Props) {
  const [values, setValues] = useState(event);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emptying, setEmptying] = useState(false);

  const router = useRouter();

  async function handleSave() {
    try {
      setSaving(true);

      await updateEvent(values.id, {
        title: values.title,
        event_date: values.event_date,
        type: values.type,
        status: values.status,
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
    <div className="space-y-8">
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#1F1F1F]">Configuración</h2>
          <p className="mt-1 text-sm text-[#7D7467]">Información básica y estado de la galería.</p>
        </div>
        <EventInfoForm
          values={values}
          onChange={setValues}
          onSave={handleSave}
          saving={saving}
        />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#1F1F1F]">Apariencia</h2>
          <p className="mt-1 text-sm text-[#7D7467]">La portada y el mensaje que verán tus invitados.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <EventCover values={values} onChange={setValues} />
          <EventWelcomeMessage values={values} onChange={setValues} />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#1F1F1F]">Contenido</h2>
          <p className="mt-1 text-sm text-[#7D7467]">Modera fotografías y recuerdos compartidos por los invitados.</p>
        </div>
        <div className="space-y-5">
          <AdminPhotoManager eventId={values.id} />
          <AdminMessageManager event={values} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#A15B50]" />
          <div>
            <h2 className="text-lg font-semibold text-[#1F1F1F]">Zona de riesgo</h2>
            <p className="mt-1 text-sm text-[#7D7467]">Acciones permanentes sobre el contenido o el evento.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F1F1F]">Vaciar galería</h3>
            <p className="mt-1.5 text-sm text-[#7D7467]">Elimina todas las fotografías y conserva la configuración del evento.</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleEmptyGallery}
              disabled={emptying || stats.photoCount === 0}
              className="mt-4 h-10 rounded-full border-[#D8C7A8] px-5 text-sm"
            >
              {emptying ? "Vaciando..." : "Vaciar galería"}
            </Button>
          </div>

          <div className="rounded-2xl border border-[#E7C9C4] bg-[#FFF9F8] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#7D403A]">Eliminar evento</h3>
            <p className="mt-1.5 text-sm text-[#8B665F]">Elimina permanentemente el evento, sus fotografías y sus mensajes.</p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="mt-4 h-10 rounded-full px-5 text-sm"
            >
              {deleting ? "Eliminando..." : "Eliminar evento"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
