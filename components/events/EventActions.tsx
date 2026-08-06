"use client";

import { useState } from "react";
import { Download, QrCode, Share2 } from "lucide-react";

import { Event } from "@/types/event";
import ActionCard from "@/components/owner/ActionCard";
import { share } from "@/lib/share";
import { getEventUrl } from "@/lib/urls";
import { downloadEventQrCard } from "@/lib/qr";
import {
  downloadEventPhotos,
  DownloadStatus,
} from "@/lib/download";

import CustomizationDialog from "@/components/owner/CustomizationDialog";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  event: Event;
}

export default function EventActions({
  event,
}: Props) {
  const [isDownloading, setIsDownloading] =
    useState(false);

  const [status, setStatus] =
    useState<DownloadStatus>("preparing");

  const [current, setCurrent] = useState(0);

  const [total, setTotal] = useState(0);

  async function handleDownload() {
  try {
    setIsDownloading(true);

    setCurrent(0);
    setTotal(0);

    const result = await downloadEventPhotos(event, {
  onStatusChange(status) {
    setStatus(status);
  },

  onProgress(current, total) {
    setCurrent(current);
    setTotal(total);
  },
});

if (!result.success) {
  toast.info(
    "Este evento aún no tiene fotografías."
  );

  return;
}
  } catch (error) {
    console.error(error);

    toast.error(
  "No fue posible preparar la descarga."
);
  } finally {
    setIsDownloading(false);
  }
}

  function getTitle() {
  if (!isDownloading) {
    return "Descargar fotografías";
  }

  switch (status) {
    case "preparing":
      return "Preparando descarga...";

    case "downloading":
      return "Descargando fotografías...";

    case "zipping":
      return "Comprimiendo fotografías...";
  }
}

  function getDescription() {
  if (!isDownloading) {
    return "Descarga todas las fotografías del evento.";
  }

  switch (status) {
    case "preparing":
      return "La descarga comenzará automáticamente.";

    case "downloading":
      return `${current} de ${total} fotografías`;

    case "zipping":
      return "Generando archivo...";
  }
}

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-sm">
      <ActionCard
  variant="top"
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
  variant="middle"
  icon={<QrCode size={22} />}
  title="Descargar código QR"
  description="Obtén un código QR listo para imprimir."
  onClick={() => downloadEventQrCard(event)}
/>

<ActionCard
  variant="middle"
  icon={
  isDownloading ? (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  ) : (
    <Download size={22} />
  )
}
  title={getTitle()}
  description={getDescription()}
  onClick={handleDownload}
  loading={isDownloading}
  disabled={isDownloading}
/>

<CustomizationDialog
  event={event}
  trigger={
    <ActionCard
      variant="last"
      icon={<Sparkles size={22} />}
      title="Personalizar galería"
      description="Edita la portada y el mensaje de bienvenida."
    />
  }
/>

    </div>
  );
}