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
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const [year, month, day] = event.event_date.split("-");

  const formattedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  )
    .toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toLowerCase();

  const titleLength = event.title.trim().length;

  const titleSizeClass =
    titleLength > 46
      ? "text-[clamp(2rem,6.7vw,3rem)] sm:text-[3rem] md:text-[3.4rem]"
      : titleLength > 30
        ? "text-[clamp(2.1rem,7.3vw,3.25rem)] sm:text-[3.25rem] md:text-[3.6rem]"
        : "text-[clamp(2.2rem,7.8vw,3.5rem)] sm:text-[3.5rem] md:text-[3.8rem]";

  const heroImageClass = loaded
    ? isPortrait
      ? "object-cover md:object-contain [object-position:var(--hero-object-position-mobile)] md:[object-position:center]"
      : "object-cover [object-position:var(--hero-object-position-mobile)] md:[object-position:var(--hero-object-position-desktop)]"
    : "object-cover [object-position:var(--hero-object-position-mobile)] md:[object-position:var(--hero-object-position-desktop)]";

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#181715] shadow-[0_24px_70px_rgba(31,31,31,0.16)]">
      <div className="relative h-[460px] w-full sm:h-[530px] md:h-[590px]">
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
              onLoad={(event) => {
                setLoaded(true);
                setIsPortrait(
                  event.currentTarget.naturalHeight >
                    event.currentTarget.naturalWidth
                );
              }}
              style={{
                "--hero-object-position-mobile": isPortrait
                  ? "center 65%"
                  : `center ${Math.max(
                      0,
                      Math.min(100, (event.cover_position_y ?? 50) - 8)
                    )}%`,
                "--hero-object-position-desktop": isPortrait
                  ? "center"
                  : `center ${Math.max(
                      0,
                      Math.min(100, (event.cover_position_y ?? 50) - 8)
                    )}%`,
              } as React.CSSProperties}
              className={`${heroImageClass} brightness-[1.08] saturate-[1.03] opacity-${loaded ? "100" : "0"} ${loaded ? "scale-100" : "scale-[1.025]"} transition-all duration-[1200ms]`}
            />
          </>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,#3A362E,transparent_55%),#181715]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,15,13,0)_0%,rgba(16,15,13,0)_54%,rgba(16,15,13,0.9)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 text-white sm:px-7 sm:pb-11 md:px-9 md:pb-12">
          <h1
            className={`max-w-[15ch] text-balance font-[var(--font-display)] ${titleSizeClass} font-semibold leading-[0.92] tracking-[-0.025em] text-white/90 sm:max-w-4xl`}
          >
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-5 sm:gap-x-5">
            <div className="flex items-center gap-2 text-sm text-white/78 sm:text-base">
              <CalendarDays size={16} className="text-[#D5BD94]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}