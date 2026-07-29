"use client";

import Image from "next/image";
import { CalendarDays } from "lucide-react";

import { Event } from "@/types/event";

interface Props {
  event: Event;
}

export default function EventHero({ event }: Props) {
  const formattedDate = new Date(event.event_date).toLocaleDateString(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-lg">
      <div className="relative h-[400px] w-full">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <h1 className="text-4xl font-bold tracking-tight">
            {event.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
            <CalendarDays size={16} />
            <span>{formattedDate}</span>
          </div>

          {event.welcome_message && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90">
              {event.welcome_message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}