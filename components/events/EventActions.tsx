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

  async function handleDownload() {
    try {
      setIsDownloading(true);

      setCurrent(0);
      setTotal(0);

      const result = await downloadEventPhotos(
        event,
        {
          onStatusChange(status) {
            setStatus(status);
          },

          onProgress(current, total) {
            setCurrent(current);
            setTotal(total);
          },
        }
      );

      if (!result.success) {
        if (result.reason === "NO_PHOTOS") {
          toast.info(
            "Este evento aún no tiene fotografías."
          );
        }

        if (
          result.reason === "DOWNLOAD_ERROR"
        ) {
          toast.error(
            "No se pudo completar la descarga. Revisa tu conexión e inténtalo nuevamente."
          );
        }

        return;
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo completar la descarga. Revisa tu conexión e inténtalo nuevamente."
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
    <section>
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#A88249]">
          Acciones principales
        </p>
        <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[#1F1F1F]">
          Comparte y administra tu galería
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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

      <ActionCard
        variant="single"
        icon={<QrCode size={22} />}
        title="Compartir galería"
        description="Descarga el QR o copia el enlace para tus invitados."
        onClick={() => setQrOpen(true)}
      />

      <ActionCard
        variant="single"
        icon={
          isDownloading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download size={22} />
          )
        }
        title={getTitle().replace("fotografías", "fotos")}
        description={getDescription().replace("fotografías", "fotos")}
        onClick={handleDownload}
        loading={isDownloading}
        disabled={isDownloading}
      />

      <CustomizationDialog
        event={event}
        trigger={
          <ActionCard
            variant="single"
            icon={<Sparkles size={22} />}
            title="Personalizar"
            description="Cambia la portada y el mensaje de bienvenida."
          />
        }
      />
      </div>
    </section>
  );
}
