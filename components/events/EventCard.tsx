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
} from "lucide-react";
import { toast } from "sonner";

import { EventWithStats } from "@/types/event-with-stats";

type Props = {
  event: EventWithStats;
  formatActivity: (value: string | null) => string;
};

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
  formatActivity,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopyPublicLink() {
    try {
      const url = window.location.origin + "/e/" + event.slug;

      await navigator.clipboard.writeText(url);

      setCopied(true);
      toast.success("Enlace público copiado.");

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("No fue posible copiar el enlace.");
    }
  }

  return (
    <article className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="truncate text-lg font-semibold text-[#1F1F1F]">
              {event.title}
            </h3>

            <span
              className={
                event.status === "published"
                  ? "inline-flex items-center rounded-full bg-[#EEF6F0] px-2.5 py-1 text-[11px] font-medium text-[#37724A]"
                  : "inline-flex items-center rounded-full bg-[#FFF4DD] px-2.5 py-1 text-[11px] font-medium text-[#936A25]"
              }
            >
              {event.status === "published" ? "Publicado" : "Borrador"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7D7467]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {formatDate(event.event_date)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Camera size={13} />
              {event.photoCount} {event.photoCount === 1 ? "foto" : "fotos"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={13} />
              {event.messageCount} {event.messageCount === 1 ? "recuerdo" : "recuerdos"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {formatActivity(event.lastActivityAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link
            href={"/e/" + event.slug}
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3.5 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC]"
          >
            <ExternalLink size={14} />
            Ver galería
          </Link>

          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3.5 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC]"
          >
            <Copy size={14} />
            {copied ? "Copiado" : "Copiar enlace"}
          </button>

          <Link
            href={"/mi-galeria/" + event.organizer_token}
            target="_blank"
            className="text-xs font-medium text-[#8A7044] underline-offset-4 hover:underline"
          >
            Vista organizador
          </Link>

          <Link
            href={"/admin/events/" + event.id}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#A88249] px-4 text-xs font-medium text-white transition-colors hover:bg-[#977640]"
          >
            Administrar
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
