import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Camera, ExternalLink, MessageCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import EventEditor from "@/components/events/EventEditor";
import { Event } from "@/types/event";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatActivity(value: string | null) {
  if (!value) return "Sin actividad";

  const diff = Date.now() - new Date(value).getTime();

  if (diff < 60_000) return "Hace menos de un minuto";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return "Hace " + minutes + " min";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return "Hace " + hours + " h";

  const days = Math.floor(hours / 24);
  if (days < 30) return "Hace " + days + " d";

  return new Date(value).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    if (error) console.error("Error loading event:", error);
    notFound();
  }

  const { data: stats, error: statsError } = await supabase.rpc("get_admin_event_stats");

  if (statsError) {
    console.error("Error loading event stats:", statsError);
  }

  const eventStats = (stats ?? []).find(
    (item: { event_id: string }) => item.event_id === event.id
  );

  const photoCount = Number(eventStats?.photo_count ?? 0);
  const messageCount = Number(eventStats?.message_count ?? 0);
  const lastActivityAt = eventStats?.last_activity_at ?? null;

  const typedEvent = event as Event;

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-6 md:py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7D7467] transition-colors hover:text-[#1F1F1F]"
        >
          <ArrowLeft size={17} />
          Volver a galerías
        </Link>

        <header className="mt-5 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-[#1F1F1F] md:text-3xl">
                  {typedEvent.title}
                </h1>

                <span
                  className={
                    typedEvent.status === "published"
                      ? "inline-flex items-center rounded-full bg-[#EEF6F0] px-2.5 py-1 text-[11px] font-medium text-[#37724A]"
                      : "inline-flex items-center rounded-full bg-[#FFF4DD] px-2.5 py-1 text-[11px] font-medium text-[#936A25]"
                  }
                >
                  {typedEvent.status === "published" ? "Publicado" : "Borrador"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7D7467]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  {formatDate(typedEvent.event_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Camera size={13} />
                  {photoCount} {photoCount === 1 ? "foto" : "fotos"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle size={13} />
                  {messageCount} {messageCount === 1 ? "recuerdo" : "recuerdos"}
                </span>
                <span className="text-[#9A9287]">
                  Última actividad: {formatActivity(lastActivityAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={"/e/" + typedEvent.slug}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E7DCC8] bg-white px-3.5 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC]"
              >
                <ExternalLink size={14} />
                Ver galería
              </Link>
              <Link
                href={"/mi-galeria/" + typedEvent.organizer_token}
                className="inline-flex h-9 items-center rounded-full border border-[#E7DCC8] bg-white px-3.5 text-xs font-medium text-[#5C554B] transition-colors hover:bg-[#F7F3EC]"
              >
                Vista organizador
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6">
          <EventEditor
            event={typedEvent}
            stats={{
              photoCount,
              messageCount,
              lastActivityAt,
            }}
          />
        </div>
      </div>
    </main>
  );
}
