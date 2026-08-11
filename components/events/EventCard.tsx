"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

import { EventWithStats } from "@/types/event-with-stats";

type Props = {
  event: EventWithStats;
};

export default function EventCard({
  event,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopyOwnerLink() {
    try {
      const url = `${window.location.origin}/mi-galeria/${event.organizer_token}`;

      await navigator.clipboard.writeText(url);

      setCopied(true);
      toast.success("Enlace copiado.");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("No fue posible copiar el enlace.");
    }
  }

  return (
    <div className="rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] px-8 py-5 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#1F1F1F]">
            {event.title}
          </h3>

          <div className="mt-3 space-y-2 text-sm text-[#7D7467]">
            <p className="flex items-center gap-2">
              <span>📅</span>
              <span>{event.event_date || "Sin fecha"}</span>
            </p>

            <p className="flex items-center gap-2">
              <span>📷</span>
              <span>
                {event.photoCount}{" "}
                {event.photoCount === 1
                  ? "fotografía"
                  : "fotografías"}
              </span>
            </p>

            <p className="flex items-center gap-2 truncate">
              <span>🔗</span>

              <Link
                href={`/e/${event.slug}`}
                target="_blank"
                className="truncate text-[#A88249] transition-colors hover:underline"
              >
                /e/{event.slug}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 self-start">
          <Link
            href={`/mi-galeria/${event.organizer_token}`}
            target="_blank"
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              border-[#E7DCC8]
              bg-white
              px-6
              py-3
              text-sm
              font-medium
              text-[#5C554B]
              transition-colors
              duration-200
              hover:bg-[#F7F3EC]
            "
          >
            Vista del propietario
          </Link>

          <button
            type="button"
            onClick={handleCopyOwnerLink}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#E7DCC8]
              bg-white
              px-5
              py-3
              text-sm
              font-medium
              text-[#5C554B]
              transition-colors
              duration-200
              hover:bg-[#F7F3EC]
            "
          >
            <Copy size={16} />

            {copied ? "Copiado" : "Copiar enlace"}
          </button>

          <Link
            href={`/admin/events/${event.id}`}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#A88249]
              px-7
              py-3
              text-sm
              font-medium
              text-white
              transition-colors
              duration-200
              hover:bg-[#977640]
            "
          >
            Administrar

            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}