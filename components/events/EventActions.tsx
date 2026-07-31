"use client";

import { Download, QrCode, Share2 } from "lucide-react";

import { Event } from "@/types/event";
import ActionCard from "@/components/owner/ActionCard";
import { share } from "@/lib/share";

interface Props {
  event: Event;
}

export default function EventActions({
  event,
}: Props) {
  return (
    <div className="space-y-4">
      <ActionCard
  icon={<Share2 size={22} />}
  title="Compartir galería"
  description="Comparte el enlace con tus invitados."
  onClick={() =>
    share({
      title: event.title,
      text: "Mira las fotos de nuestro evento.",
      url: `${window.location.origin}/e/${event.slug}`,
    })
  }
/>

      <ActionCard
        icon={<QrCode size={22} />}
        title="Descargar QR"
        description="Imprime o comparte el código QR del evento."
      />

      <ActionCard
        icon={<Download size={22} />}
        title="Descargar fotografías"
        description="Descarga todas las fotografías del evento."
      />
    </div>
  );
}