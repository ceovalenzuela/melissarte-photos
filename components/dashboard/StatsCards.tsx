import {
  CalendarDays,
  CircleCheck,
  FileEdit,
  LayoutGrid,
} from "lucide-react";

import { EventWithStats } from "@/types/event-with-stats";

type Props = {
  events: EventWithStats[];
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StatsCards({ events }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const published = events.filter(
    (event) => event.status === "published"
  ).length;

  const drafts = events.filter(
    (event) => event.status === "draft"
  ).length;

  const upcomingEvents = events
    .filter((event) => {
      const [year, month, day] = event.event_date.split("-");
      const eventDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      return eventDate >= today;
    })
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const nextEvent = upcomingEvents[0] ?? null;

  const items = [
    {
      icon: <LayoutGrid size={17} />,
      value: events.length.toString(),
      label: events.length === 1 ? "Evento" : "Eventos",
      description: "Registrados",
      className: "",
    },
    {
      icon: <CircleCheck size={17} />,
      value: published.toString(),
      label: "Publicados",
      description: "Activos",
      className: "",
    },
    {
      icon: <FileEdit size={17} />,
      value: drafts.toString(),
      label: "Borradores",
      description: "Pendientes",
      className: "",
    },
    {
      icon: <CalendarDays size={17} />,
      value: nextEvent ? nextEvent.title : "—",
      label: "Próximo evento",
      description: nextEvent
        ? formatDate(nextEvent.event_date)
        : "Sin eventos próximos",
      className: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <section className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`min-w-0 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] px-4 py-4 shadow-sm sm:px-5 ${item.className}`}
        >
          <div className="flex min-w-0 items-center gap-2 text-[#A88249]">
            {item.icon}
            <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B8378]">
              {item.label}
            </span>
          </div>

          <p
            className={
              item.label === "Próximo evento"
                ? "mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-[#1F1F1F] sm:text-xl"
                : "mt-2 text-xl font-semibold text-[#1F1F1F]"
            }
            title={item.label === "Próximo evento" ? item.value : undefined}
          >
            {item.value}
          </p>

          <p className="mt-1 truncate text-xs text-[#7D7467]">
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
}