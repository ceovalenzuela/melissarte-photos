"use client";

import { useState } from "react";
import { Download, QrCode } from "lucide-react";

import { Event } from "@/types/event";
import ActionCard from "@/components/owner/ActionCard";
import { downloadEventQrCard } from "@/lib/qr";
import {
  downloadEventPhotos,
  DownloadStatus,
} from "@/lib/download";

import CustomizationDialog from "@/components/owner/CustomizationDialog";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect } from "react";

import QRCode from "qrcode";
import { getEventUrl } from "@/lib/urls";
import { Button } from "@/components/ui/button";

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

  const [qrOpen, setQrOpen] = useState(false);

  const [qrImage, setQrImage] = useState("");

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

async function handleCopyLink() {
  try {
    const url = getEventUrl(
      window.location.origin,
      event.slug
    );

    await navigator.clipboard.writeText(url);

toast.success("Enlace copiado.");

setQrOpen(false);
  } catch (error) {
    console.error(error);

    toast.error(
      "No fue posible copiar el enlace."
    );
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
    return "Descarga un archivo contodas las fotografías del evento.";
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

useEffect(() => {
  if (!qrOpen) return;

  async function generateQr() {
    const url = getEventUrl(
      window.location.origin,
      event.slug
    );

    const dataUrl = await QRCode.toDataURL(url, {
      width: 500,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    setQrImage(dataUrl);
  }

  generateQr();
}, [qrOpen, event.slug]);

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-lg">

  <Dialog
  open={qrOpen}
  onOpenChange={setQrOpen}
>
  <DialogContent className="max-w-md rounded-3xl px-6 pb-6 pt-5">
    <DialogHeader className="space-y-2">
      <DialogTitle className="text-center text-xl">
        Código QR
      </DialogTitle>
    </DialogHeader>

    <p className="mt-1 text-center text-sm leading-6 text-[#7D7467]">
  Comparte este código QR o copia el enlace para que tus invitados puedan subir y ver las fotografías del evento.
</p>

<div className="mt-3 flex justify-center">
  {qrImage && (
    <img
      src={qrImage}
      alt="Código QR"
      className="h-72 w-72 rounded-2xl border border-[#E7DCC8] bg-white p-3"
    />
  )}
</div>

<div className="mt-6 space-y-3">

  <button
    onClick={() => {
      downloadEventQrCard(event);
      setQrOpen(false);
    }}
    className="
      h-12
      w-full
      rounded-full
      bg-[#A88249]
      text-white
      font-medium
      transition-colors
      hover:bg-[#977640]
    "
  >
    Descargar QR
  </button>

  <button
    onClick={handleCopyLink}
    className="
      h-12
      w-full
      rounded-full
      border
      border-[#E7DCC8]
      bg-white
      text-[#5C554B]
      font-medium
      transition-colors
      hover:bg-[#F7F3EC]
    "
  >
    Copiar enlace
  </button>

</div>

  </DialogContent>
</Dialog>

<ActionCard
  variant="top"
  icon={<QrCode size={22} />}
  title="Código QR"
  description="Comparte tu galería mediante un código QR o copia el enlace."
  onClick={() => setQrOpen(true)}
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
      title="Portada y bienvenida"
      description="Personaliza la portada y el mensaje para tus invitados."
    />
  }
/>

    </div>
  );
}