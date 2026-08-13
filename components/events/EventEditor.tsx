"use client";

import { useState } from "react";

import { Event } from "@/types/event";
import { updateEvent } from "@/lib/events";

import EventInfoForm from "./EventInfoForm";
import EventCover from "./EventCover";
import EventWelcomeMessage from "./EventWelcomeMessage";

import { deleteEvent } from "@/lib/events";
import { deletePhotosByEvent } from "@/lib/photos";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminPhotoManager from "./AdminPhotoManager";

interface Props {
  event: Event;
}

export default function EventEditor({ event }: Props) {
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
        slug: values.slug,
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

    if (!confirmed) {
      return;
    }

    try {
      setEmptying(true);

      await deletePhotosByEvent(values.id);

      toast.success("Galería vaciada.");
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible vaciar la galería."
      );
    } finally {
      setEmptying(false);
    }
  }

  async function handleDelete() {
  const confirmed = confirm(
    "¿Eliminar este evento?\n\nSe eliminarán todas las fotografías y esta acción no se puede deshacer."
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeleting(true);

    await deletePhotosByEvent(values.id);

    await deleteEvent(values.id);

    toast.success("Evento eliminado.");

    router.push("/admin");
  } catch (error) {
    console.error(error);

    toast.error(
      "No fue posible eliminar el evento."
    );
  } finally {
    setDeleting(false);
  }
}

  return (
    <div className="space-y-5">
      <EventInfoForm
        values={values}
        onChange={setValues}
        onSave={handleSave}
        saving={saving}
      />

<EventCover
  values={values}
  onChange={setValues}
/>

<EventWelcomeMessage
  values={values}
  onChange={setValues}
/>

<AdminPhotoManager eventId={values.id} />

<div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
  <div>
    <h2 className="text-xl font-semibold text-[#1F1F1F]">
      Vaciar galería
    </h2>

    <p className="mt-2 text-sm text-[#7D7467]">
      Elimina todas las fotografías de este evento sin eliminar el evento.
    </p>
  </div>

  <Button
    variant="destructive"
    onClick={handleEmptyGallery}
    disabled={emptying}
    className="h-12 rounded-full px-7"
  >
    {emptying ? "Vaciando..." : "Vaciar galería"}
  </Button>
</div>

<div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
  <div>
    <h2 className="text-2xl font-semibold text-[#1F1F1F]">
      Eliminar evento
    </h2>

    <p className="mt-2 text-sm text-[#7D7467]">
      Se eliminará permanentemente el evento y todas las fotografías asociadas. Esta acción no se puede deshacer.
    </p>
  </div>

  <div className="mt-6">
  <Button
    variant="destructive"
    onClick={handleDelete}
    disabled={deleting}
    className="h-12 rounded-full px-7"
  >
    {deleting
      ? "Eliminando..."
      : "Eliminar evento"}
  </Button>
</div>
</div>

    </div>
  );
}