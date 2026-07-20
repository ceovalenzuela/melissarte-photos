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
      <DialogTrigger render={<Button />}>
        {mode === "create" ? "Nuevo evento" : "Editar"}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Crear evento"
              : "Editar evento"}
          </DialogTitle>
        </DialogHeader>

        <EventForm
          title={title}
          eventDate={eventDate}
          onTitleChange={setTitle}
          onDateChange={setEventDate}
        />

        <Button
          className="mt-4 w-full"
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