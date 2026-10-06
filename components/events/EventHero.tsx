"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Camera } from "lucide-react";

import { Event } from "@/types/event";

interface Props {
  event: Event;
  photoCount?: number;
  showWelcomeMessage?: boolean;
}

export default function EventHero({
  event,
  photoCount = 0,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const [year, month, day] = event.event_date.split("-");

  const formattedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#181715] shadow-[0_24px_70px_rgba(31,31,31,0.16)]">
      <div className="relative h-[450px] w-full sm:h-[520px] md:h-[580px]">
        {event.cover_image ? (
          <>
            <Image
              src={event.cover_image}
              alt=""
              fill
              priority
              className="scale-110 object-cover blur-3xl opacity-45"
            />

            <Image
              src={event.cover_image}
              alt={event.title}
              fill
              priority
              onLoad={() => setLoaded(true)}
              style={{
                objectPosition: `center ${event.cover_position_y ?? 50}%`,
              }}
              className={
                loaded
                  ? "object-cover scale-100 opacity-100 transition-all duration-[1200ms]"
                  : "object-cover scale-[1.025] opacity-0 transition-all duration-[1200ms]"
              }
            />
          </>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,#3A362E,transparent_55%),#181715]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,15,13,0.18)_0%,transparent_34%,rgba(16,15,13,0.78)_100%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-4 pt-4 text-white sm:px-7 sm:pt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-2.5 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D5BD94] shadow-[0_0_0_3px_rgba(213,189,148,0.12)]" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/80">
              Galería en vivo
            </span>
          </div>

        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-7 text-white sm:px-7 sm:pb-9 md:px-9 md:pb-10">
          <h1 className="max-w-[13ch] font-[var(--font-display)] text-[clamp(2.9rem,11vw,4.5rem)] font-semibold leading-[0.88] tracking-[-0.025em] text-white sm:max-w-4xl md:text-[5.25rem]">
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-5 sm:gap-x-5">
            <div className="flex items-center gap-2 text-sm text-white/78 sm:text-base">
              <CalendarDays size={16} className="text-[#D5BD94]" />
              <span className="capitalize">{formattedDate}</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}