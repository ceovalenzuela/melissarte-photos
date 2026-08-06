"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";

import { Event } from "@/types/event";

interface Props {
  event: Event;
  photoCount?: number;
  showWelcomeMessage?: boolean;
}

export default function EventHero({
  event,
  photoCount = 0,
  showWelcomeMessage = true,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const formattedDate = new Date(
    event.event_date
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-lg">
      <div className="relative h-[500px] w-full">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            priority
            onLoad={() => setLoaded(true)}
            className={`
              object-cover
              transition-all
              duration-700
              ${
                loaded
                  ? "scale-100 opacity-100"
                  : "scale-[1.02] opacity-0"
              }
            `}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-8 pb-12 pt-16 text-white">
          <h1 className="text-4xl font-semibold tracking-tight md:text-[3.25rem]">
            {event.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-base text-white/90">
            <CalendarDays size={18} />
            <span>{formattedDate}</span>
          </div>

          <div className="mt-4">
            <div
              className="
  inline-flex
  rounded-full
  border
  border-white/15
  bg-white/10
  px-3
  py-1.5
  backdrop-blur-lg

              "
            >
              <span className="text-sm font-medium text-white">
                {photoCount} fotografías
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}