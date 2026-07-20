/**
 * --------------------------------------------------
 * MelissArte Photos
 * EventForm
 * --------------------------------------------------
 */

"use client";

import { Input } from "@/components/ui/input";

type Props = {
  title: string;
  eventDate: string;

  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

export default function EventForm({
  title,
  eventDate,
  onTitleChange,
  onDateChange,
}: Props) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Nombre del evento"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      <Input
        type="date"
        value={eventDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </div>
  );
}