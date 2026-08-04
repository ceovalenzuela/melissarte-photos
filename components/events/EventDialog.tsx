"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import EventForm from "./EventForm";

import { Event } from "@/types/event";
import { Plus } from "lucide-react";

type Props = {
  mode: "create" | "edit";

  event?: Event;

  loading: boolean;

  createEvent: (data: {
    title: string;
    event_date: string;
  }) => Promise<void>;

  updateEvent: (
    id: string,
    updates: Partial<Event>
  ) => Promise<void>;
};

export default function EventDialog({
  mode,
  event,
  loading,
  createEvent,
  updateEvent,
}: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    if (mode === "edit" && event) {
      setTitle(event.title);
      setEventDate(event.event_date ?? "");
    }

    if (mode === "create") {
      setTitle("");
      setEventDate("");
    }
  }, [mode, event, open]);

  async function handleSubmit() {
    if (!title.trim()) return;

    if (mode === "create") {
      await createEvent({
        title,
        event_date: eventDate,
      });

      setTitle("");
      setEventDate("");
    } else if (event) {
      await updateEvent(event.id, {
        title,
        event_date: eventDate,
      });
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
  render={
    <Button
  className="
    h-12
    rounded-full
    bg-neutral-800
    px-7
    text-sm
    font-medium
    text-white
    transition-colors
    duration-200
    hover:bg-black
  "
>
  <Plus size={16} strokeWidth={2.5} />
  Nuevo evento
</Button>
  }
/>

      <DialogContent>
        <DialogHeader>
  <DialogTitle className="text-2xl font-semibold text-[#1F1F1F]">
    {mode === "create"
      ? "Crear evento"
      : "Editar evento"}
  </DialogTitle>

  <p className="mt-2 text-sm text-[#7D7467]">
    Completa la información básica del evento.
  </p>
</DialogHeader>

        <EventForm
          title={title}
          eventDate={eventDate}
          onTitleChange={setTitle}
          onDateChange={setEventDate}
        />

        <Button
  className="
    mt-4
    w-full
    rounded-full
    bg-neutral-800
    py-3
    text-sm
    font-medium
    hover:bg-black
  "
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Guardando..."
            : mode === "create"
            ? "Crear evento"
            : "Guardar cambios"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}