"use client";

import { useEffect, useState } from "react";
import {
  Download,
  QrCode,
  Sparkles,
} from "lucide-react";

import { Event } from "@/types/event";
import ActionCard from "@/components/owner/ActionCard";
import { downloadEventQrCard } from "@/lib/qr";
import {
  downloadEventPhotos,
  DownloadStatus,
} from "@/lib/download";

import CustomizationDialog from "@/components/owner/CustomizationDialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QRCode from "qrcode";
import { getEventUrl } from "@/lib/urls";

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

      case "error":
        return "Descarga no completada";

      default:
        return "Descargar fotografías";
    }
  }

  function getDescription() {
    if (!isDownloading) {
      return "Descarga todas las fotografías del evento en un solo archivo.";
    }

    switch (status) {
      case "preparing":
        return "La descarga comenzará automáticamente.";

      case "downloading":
        return `${current} de ${total} fotografías`;

      case "zipping":
        return "Generando archivo...";

      case "error":
        return "Revisa tu conexión e inténtalo nuevamente.";

      default:
        return "";
    }
  }

  useEffect(() => {
    if (!qrOpen) return;

    async function generateQr() {
      const url = getEventUrl(
        window.location.origin,
        event.slug
      );

      const dataUrl =
        await QRCode.toDataURL(url, {
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
                font-medium
                text-white
                transition-colors
                hover:bg-[#977640]
              "
            >
              Descargar QR
            </button>

            <button
              onClick={async () => {
                try {
                  const url = getEventUrl(
                    window.location.origin,
                    event.slug
                  );

                  await navigator.clipboard.writeText(
                    url
                  );

                  toast.success(
                    "Enlace copiado."
                  );

                  setQrOpen(false);
                } catch (error) {
                  console.error(error);

                  toast.error(
                    "No fue posible copiar el enlace."
                  );
                }
              }}
              className="
                h-12
                w-full
                rounded-full
                border
                border-[#E7DCC8]
                bg-white
                font-medium
                text-[#5C554B]
                transition-colors
                hover:bg-[#F7F3EC]
              "
            >
              Copiar enlace
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={messagesOpen}
        onOpenChange={setMessagesOpen}
      >
        <DialogContent className="max-w-md rounded-3xl px-6 pb-6 pt-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-center text-xl">
              Mensajes
            </DialogTitle>
          </DialogHeader>

          <p className="mt-1 text-center text-sm leading-6 text-[#7D7467]">
            Guarda los recuerdos que tus invitados compartieron en tu evento.
          </p>

          {loadingMessages ? (
            <p className="py-6 text-center text-sm text-[#7D7467]">
              Cargando mensajes...
            </p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 text-center">
                  <p className="text-2xl font-semibold text-[#1F1F1F]">
                    {messageCounts.text}
                  </p>
                  <p className="mt-1 text-xs text-[#7D7467]">
                    Mensajes escritos
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 text-center">
                  <p className="text-2xl font-semibold text-[#1F1F1F]">
                    {messageCounts.audio}
                  </p>
                  <p className="mt-1 text-xs text-[#7D7467]">
                    Mensajes de voz
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadMessagesPdf}
                  disabled={
                    messageDownloading !== null ||
                    messageCounts.text === 0
                  }
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#A88249]
                    px-5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-[#977640]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {messageDownloading === "pdf" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <FileText size={17} />
                  )}
                  Descargar libro de firmas
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAudioZip}
                  disabled={
                    messageDownloading !== null ||
                    messageCounts.audio === 0
                  }
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-[#D9CBB3]
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    text-[#5F574D]
                    transition
                    hover:bg-[#F8F4EE]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {messageDownloading === "audio" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
                  ) : (
                    <Download size={17} />
                  )}
                  Descargar audios
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ActionCard
        variant="top"
        icon={<QrCode size={22} />}
        title="Código QR"
        description="Descarga el QR o copia el enlace de tu galería y compártelo."
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
