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
  messagesEnabled: boolean;
  onMessagesEnabledChange: (value: boolean) => void;
};

export default function EventForm({
  title,
  eventDate,
  onTitleChange,
  onDateChange,
  messagesEnabled,
  onMessagesEnabledChange,
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

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E7DCC8] bg-[#FDFBF8] p-4">
        <input
          type="checkbox"
          checked={messagesEnabled}
          onChange={(e) => onMessagesEnabledChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#A88249]"
        />
        <span>
          <span className="block text-sm font-medium text-[#5C554B]">
            Habilitar mensajes de invitados
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#8B8378]">
            Permite que tus invitados dejen mensajes escritos y de voz en la galería.
          </span>
        </span>
      </label>
    </div>
  );
}