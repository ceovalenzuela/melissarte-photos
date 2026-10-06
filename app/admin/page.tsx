"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import EventCard from "@/components/events/EventCard";
import EventDialog from "@/components/events/EventDialog";

import { useEvents } from "@/hooks/useEvents";
import { EventWithStats } from "@/types/event-with-stats";

type StatusFilter = "all" | "published" | "draft";
type SortOrder = "upcoming" | "created_desc" | "created_asc" | "activity";

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
}

function compareUpcoming(a: EventWithStats, b: EventWithStats) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const aDate = parseLocalDate(a.event_date);
  const bDate = parseLocalDate(b.event_date);

  const aFuture = aDate.getTime() >= now.getTime();
  const bFuture = bDate.getTime() >= now.getTime();

  if (aFuture !== bFuture) {
    return aFuture ? -1 : 1;
  }

  if (aFuture && bFuture) {
    return aDate.getTime() - bDate.getTime();
  }

  return bDate.getTime() - aDate.getTime();
}

export function formatActivity(value: string | null) {
  if (!value) {
    return "Sin actividad";
  }

  const diff = Date.now() - new Date(value).getTime();

  if (diff < 60_000) {
    return "Hace menos de un minuto";
  }

  const minutes = Math.floor(diff / 60_000);

  if (minutes < 60) {
    return "Hace " + minutes + " min";
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return "Hace " + hours + " h";
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return "Hace " + days + " d";
  }

  return new Date(value).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function sortEvents(events: EventWithStats[], order: SortOrder) {
  return [...events].sort((a, b) => {
    if (order === "upcoming") {
      return compareUpcoming(a, b);
    }

    if (order === "activity") {
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;

      return bTime - aTime;
    }

    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();

    return order === "created_asc" ? aTime - bTime : bTime - aTime;
  });
}

export default function AdminPage() {
  const {
    events,
    loading,
    createEvent,
    updateEvent,
  } = useEvents();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("upcoming");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.slug.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || event.status === status;

      return matchesSearch && matchesStatus;
    });

    return sortEvents(filtered, sortOrder);
  }, [events, search, status, sortOrder]);

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <AppHeader title="Galerías">
        <EventDialog
          mode="create"
          createEvent={createEvent}
          updateEvent={updateEvent}
          loading={loading}
        />
      </AppHeader>

      <div className="mx-auto max-w-7xl space-y-5 p-6">
        <StatsCards events={events} />

        <section className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-xl">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9287]" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o URL..."
                className="h-11 w-full rounded-xl border border-[#E7DCC8] bg-white pl-10 pr-10 text-sm text-[#1F1F1F] outline-none transition focus:border-[#A88249]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#8B8378] hover:bg-[#F7F3EC]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <span className="sr-only">Filtrar por estado</span>
                <ListFilter size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9287]" />
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusFilter)}
                  className="h-11 rounded-xl border border-[#E7DCC8] bg-white pl-9 pr-8 text-sm text-[#5C554B] outline-none focus:border-[#A88249]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Borradores</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Ordenar eventos</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="h-11 rounded-xl border border-[#E7DCC8] bg-white px-3 text-sm text-[#5C554B] outline-none focus:border-[#A88249]"
                >
                  <option value="upcoming">Próximos eventos</option>
                  <option value="activity">Última actividad</option>
                  <option value="created_desc">Más recientes</option>
                  <option value="created_asc">Más antiguos</option>
                </select>
              </label>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#8B8378]">
            {filteredEvents.length} {filteredEvents.length === 1 ? "evento encontrado" : "eventos encontrados"}
          </p>
        </section>

        <section className="space-y-3">
          {loading && events.length === 0 ? (
            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 text-center text-sm text-[#7D7467]">
              Cargando galerías...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9CBB3] bg-[#FDFBF8] p-10 text-center">
              <p className="text-sm font-medium text-[#5C554B]">
                No encontramos galerías con esos criterios.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="mt-2 text-xs font-medium text-[#A88249] underline underline-offset-4 hover:text-[#977640]"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                formatActivity={formatActivity}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
