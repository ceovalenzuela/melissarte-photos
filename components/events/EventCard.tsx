"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EventWithStats } from "@/types/event-with-stats";

type Props = {
  event: EventWithStats;
};

export default function EventCard({
  event,
}: Props) {
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
                className="truncate text-[#B08D57] transition-colors hover:underline"
              >
                /e/{event.slug}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 self-start">
          <Link
  href={`/dashboard/${event.slug}`}
  className="
    inline-flex
    items-center
    justify-center
    rounded-full
    bg-neutral-800
    px-6
    py-3
    text-sm
    font-medium
    text-white
    transition-colors
    duration-200
    hover:bg-black
  "
>
  Owner
</Link>

          <Link
            href={`/admin/events/${event.id}`}
            className="
              inline-flex
              items-center
              gap-2
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
    </div>
  );
}