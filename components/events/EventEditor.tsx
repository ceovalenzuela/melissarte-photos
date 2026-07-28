"use client";

import { useState } from "react";

import { Event } from "@/types/event";
import { updateEvent } from "@/lib/events";

import EventInfoForm from "./EventInfoForm";
import EventCover from "./EventCover";
import EventWelcomeMessage from "./EventWelcomeMessage";

interface Props {
  event: Event;
}

export default function EventEditor({ event }: Props) {
  const [values, setValues] = useState(event);
  const [saving, setSaving] = useState(false);

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

      alert("Cambios guardados");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}
