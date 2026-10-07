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
    <main className="min-h-screen min-w-0 bg-[#F7F5F1]">
      <AppHeader title="Galerías">
        <EventDialog
          mode="create"
          createEvent={createEvent}
          updateEvent={updateEvent}
          loading={loading}
        />
      </AppHeader>

      <div className="mx-auto max-w-7xl min-w-0 space-y-5 px-4 py-5 sm:p-6">
        <StatsCards events={events} />

        <section className="min-w-0 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-4 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="relative min-w-0 w-full">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9287]"
              />

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

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="relative min-w-0">
                <span className="sr-only">Filtrar por estado</span>
                <ListFilter
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9287]"
                />
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as StatusFilter)
                  }
                  className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[#E7DCC8] bg-white pl-9 pr-9 text-sm text-[#5C554B] outline-none focus:border-[#A88249]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Borradores</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7D7467]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="m6 8 4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </label>

              <label className="relative min-w-0">
                <span className="sr-only">Ordenar eventos</span>
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as SortOrder)
                  }
                  className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[#E7DCC8] bg-white px-3.5 pr-9 text-sm text-[#5C554B] outline-none focus:border-[#A88249]"
                >
                  <option value="upcoming">Próximos eventos</option>
                  <option value="activity">Última actividad</option>
                  <option value="created_desc">Más recientes</option>
                  <option value="created_asc">Más antiguos</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7D7467]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="m6 8 4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </label>
            </div>

            <p className="text-xs text-[#8B8378]">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1
                ? "evento encontrado"
                : "eventos encontrados"}
            </p>
          </div>
        </section>

        <section className="min-w-0 space-y-3">
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
                  setSortOrder("upcoming");
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