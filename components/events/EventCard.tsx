"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Event } from "@/types/event";

type Props = {
  event: Event;
};

export default function EventCard({
  event,
}: Props) {
  return (
    <div className="rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#1F1F1F]">
            {event.title}
          </h3>

          <div className="mt-4 space-y-1 text-sm text-[#7D7467]">
            <p>
              <span className="font-medium text-[#5C554B]">
                Fecha:
              </span>{" "}
              {event.event_date || "Sin fecha"}
            </p>

            <p className="truncate">
              <span className="font-medium text-[#5C554B]">
                Enlace:
              </span>{" "}
              /e/{event.slug}
            </p>
          </div>
        </div>

        <Link
          href={`/admin/events/${event.id}`}
          className="
            inline-flex
            items-center
            gap-2
            self-start
            rounded-full
            bg-neutral-800
            px-7
            py-3
            text-sm
            font-medium
            text-white
            transition-colors
            duration-200
            hover:bg-black
          "
        >
          Administrar

          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}