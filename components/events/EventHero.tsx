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
      <div className="relative h-[460px] w-full">
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

        {/* Overlay */}
<div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />

{/* Logo */}
<div className="absolute bottom-8 right-5 z-10 md:bottom-7 md:right-7">
  <Image
    src="/me-logo.png"
    alt="MelissArte Photos"
    width={110}
    height={40}
    className="h-auto w-[78px] opacity-99 md:w-[100px]"
  />
</div>

        {/* Título */}
        <div className="absolute inset-x-0 top-0 px-8 pt-10 text-white">
          <h1 className="max-w-[80%] text-[27px] font-semibold leading-tight tracking-tight text-white/90 md:text-4xl">
            {event.title}
          </h1>
        </div>

        {/* Información */}
        <div className="absolute inset-x-0 bottom-0 px-8 pb-10 text-white">
          <div className="flex items-center gap-2 text-base text-white/90">
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