"use client";

import { Download, QrCode, Share2 } from "lucide-react";

import { Event } from "@/types/event";
import ActionCard from "@/components/owner/ActionCard";
import { share } from "@/lib/share";
import { getEventUrl } from "@/lib/urls";
import { downloadEventQrCard } from "@/lib/qr";
import { downloadEventPhotos } from "@/lib/download";

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
      url: getEventUrl(
  window.location.origin,
  event.slug
),
    })
  }
/>

      <ActionCard
  icon={<QrCode size={22} />}
  title="Descargar código QR"
  description="Obtén un código QR listo para imprimir."
  onClick={() => downloadEventQrCard(event)}
/>

      <ActionCard
        icon={<Download size={22} />}
        title="Descargar fotografías"
        description="Descarga todas las fotografías del evento."
        onClick={() => downloadEventPhotos(event)}
      />
    </div>
  );
}