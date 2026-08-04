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

      await downloadEventPhotos(event, {
        onStatusChange(status) {
          setStatus(status);
        },

        onProgress(current, total) {
          setCurrent(current);
          setTotal(total);
        },
      });
    } finally {
      setIsDownloading(false);
    }
  }

  function getTitle() {
  return "Descargar fotografías";
}

  function getDescription() {
  if (!isDownloading) {
    return "Descarga todas las fotografías del evento.";
  }

  switch (status) {
    case "preparing":
      return "Preparando descarga...";

    case "downloading":
      return `${current} de ${total} fotografías descargadas`;

    case "zipping":
      return "Preparando archivo...";
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
  variant="bottom"
  icon={<Download size={22} />}
  title={getTitle()}
  description={getDescription()}
  onClick={handleDownload}
  loading={isDownloading}
  disabled={isDownloading}
/>
    </div>
  );
}