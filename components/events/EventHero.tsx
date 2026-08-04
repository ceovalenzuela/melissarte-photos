import Image from "next/image";
import { CalendarDays } from "lucide-react";

import { Event } from "@/types/event";

interface Props {
  event: Event;
  showWelcomeMessage?: boolean;
}

export default function EventHero({
  event,
}: Props) {
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
      <div className="relative h-[460px] w-full">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-8 pb-16 pt-16 text-white">
          <h1 className="text-4xl md:text-[3.25rem] font-semibold tracking-tight">
            {event.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-base text-white/85">
            <CalendarDays size={18} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}