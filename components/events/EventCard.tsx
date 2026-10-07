"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Clock3,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

import { EventWithStats } from "@/types/event-with-stats";
import { downloadEventQrCard } from "@/lib/qr";

type Props = {
  event: EventWithStats;
  formatActivity?: (value: string | null) => string;
};

function defaultFormatActivity(value: string | null) {
  if (!value) return "Sin actividad";

  const diff = Date.now() - new Date(value).getTime();

  if (diff < 60_000) return "Hace menos de un minuto";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return "Hace " + minutes + " min";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return "Hace " + hours + " h";

  const days = Math.floor(hours / 24);
  if (days < 30) return "Hace " + days + " d";

  return new Date(value).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventCard({
  event,
  formatActivity = defaultFormatActivity,
}: Props) {
  const [copied, setCopied] = useState<"guest" | "organizer" | null>(null);
  const [downloadingQr, setDownloadingQr] = useState(false);

  async function handleCopyLink(type: "guest" | "organizer") {
    try {
      const url =
        type === "guest"
          ? window.location.origin + "/e/" + event.slug
          : window.location.origin + "/mi-galeria/" + event.organizer_token;

      await navigator.clipboard.writeText(url);

      setCopied(type);
      toast.success(
        type === "guest"
          ? "Enlace de invitados copiado."
          : "Enlace del organizador copiado."
      );

      window.setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("No fue posible copiar el enlace.");
    }
  }

  async function handleDownloadQr() {
    try {
      setDownloadingQr(true);
      await downloadEventQrCard(event);
      toast.success("QR descargado.");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible descargar el QR.");
    } finally {
      setDownloadingQr(false);
    }
  }

  return (
    <article className="min-w-0 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h3
              className="min-w-0 truncate text-lg font-semibold text-[#1F1F1F]"
              title={event.title}
            >
              {event.title}
            </h3>

            <span
              className={
                event.status === "published"
                  ? "inline-flex shrink-0 items-center rounded-full bg-[#EEF6F0] px-2.5 py-1 text-[11px] font-medium text-[#37724A]"
                  : "inline-flex shrink-0 items-center rounded-full bg-[#FFF4DD] px-2.5 py-1 text-[11px] font-medium text-[#936A25]"
              }
            >
              {event.status === "published" ? "Publicado" : "Borrador"}
            </span>
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7D7467]">
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <CalendarDays size={13} />
              {formatDate(event.event_date)}
            </span>

            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Camera size={13} />
              {event.photoCount} {event.photoCount === 1 ? "foto" : "fotos"}
            </span>

            <span className="inline-flex shrink-0 items-center gap-1.5">
              <MessageCircle size={13} />
              {event.messageCount} {event.messageCount === 1 ? "recuerdo" : "recuerdos"}
            </span>

            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Clock3 size={13} />
              {formatActivity(event.lastActivityAt)}
            </span>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end">
          <Link
            href={"/e/" + event.slug}
            target="_blank"
            className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC] lg:w-auto lg:px-3.5"
          >
            <ExternalLink size={14} />
            Ver galería
          </Link>

          <button
            type="button"
            onClick={() => handleCopyLink("guest")}
            className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC] lg:w-auto lg:px-3.5"
          >
            <Copy size={14} />
            <span className="truncate">
              {copied === "guest" ? "Copiado" : "Copiar invitados"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCopyLink("organizer")}
            className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC] lg:w-auto lg:px-3.5"
          >
            <Copy size={14} />
            <span className="truncate">
              {copied === "organizer" ? "Copiado" : "Copiar organizador"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            disabled={downloadingQr}
            className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:px-3.5"
          >
            {downloadingQr ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#A88249] border-t-transparent" />
            ) : (
              <QrCode size={14} />
            )}
            <span className="truncate">
              {downloadingQr ? "Generando..." : "Descargar QR"}
            </span>
          </button>

          <Link
            href={"/admin/events/" + event.id}
            className="col-span-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#A88249] px-4 text-xs font-medium text-white transition-colors hover:bg-[#977640] lg:col-span-1 lg:w-auto"
          >
            Administrar
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}