"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { Event } from "@/types/event";

interface Props {
  event: Event;
}

export default function OwnerEventHeader({ event }: Props) {
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
    <header className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/me-logo.png"
            alt="Melissarte Photos"
            width={120}
            height={42}
            className="h-auto w-[105px]"
          />
          <span className="hidden h-4 w-px bg-[#E7DCC8] sm:block" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-[#9A9287] sm:block">
            Mi galería
          </span>
        </div>

        <Link
          href={`/e/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E1D5C1] bg-white px-3.5 py-2 text-xs font-medium text-[#5F574D] transition-colors hover:bg-[#F8F4EE]"
        >
          Ver galería
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4 sm:gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F3ECE2] shadow-sm sm:h-24 sm:w-24">
          {event.cover_image ? (
            <Image
              src={event.cover_image}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-[10px] uppercase tracking-[0.14em] text-[#A49B8F]">
              Sin portada
            </div>
          )}
        </div>

        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#F3ECE2] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B6D3B]">
            {event.status === "published" ? "Publicado" : "Borrador"}
          </span>

          <h1 className="mt-2 truncate font-[var(--font-display)] text-3xl font-semibold leading-none tracking-[-0.02em] text-[#1F1F1F] sm:text-4xl">
            {event.title}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-[#7D7467]">
            <CalendarDays size={14} className="text-[#A88249]" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
}