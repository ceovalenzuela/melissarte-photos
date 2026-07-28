import { CalendarDays } from "lucide-react";

import { Event } from "@/types/event";

interface PublicHeroProps {
  event: Event;
}

export default function PublicHero({ event }: PublicHeroProps) {
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative h-[460px] overflow-hidden rounded-3xl shadow-xl">
      {event.cover_image ? (
        <img
          src={event.cover_image}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="absolute bottom-8 left-8 right-8 text-white">
        {formattedDate && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-md">
            <CalendarDays size={16} />
            <span className="capitalize">{formattedDate}</span>
          </div>
        )}

        <h1 className="text-4xl font-bold leading-tight drop-shadow-lg md:text-5xl">
          {event.title}
        </h1>
      </div>
    </section>
  );
}