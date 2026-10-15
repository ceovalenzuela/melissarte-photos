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

  const invitationEnabled = events.filter((event) => event.invitation_enabled === true).length;

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
    { icon: <LayoutGrid size={17} />, value: events.length.toString(), label: "Eventos", description: "Registrados" },
    { icon: <CircleCheck size={17} />, value: published.toString(), label: "Publicados", description: "Activos" },
    { icon: <FileEdit size={17} />, value: drafts.toString(), label: "Borradores", description: "Pendientes" },
    { icon: <CircleCheck size={17} />, value: invitationEnabled.toString(), label: "Invitaciones", description: "Habilitadas" },
  ];

  return (
    <section aria-label="Resumen de eventos" className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-3 shadow-sm sm:p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6D8] text-[#A88249] sm:h-10 sm:w-10">{item.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#7D7467] sm:text-sm">{item.label}</p>
            <p className="mt-0.5 text-2xl font-semibold leading-7 text-[#1F1F1F]">{item.value}</p>
            <p className="truncate text-[11px] text-[#8B8378] sm:text-xs">{item.description}</p>
          </div>
        </div>
      ))}
      <div className="col-span-2 flex min-w-0 items-center gap-3 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-3 shadow-sm sm:col-span-4 sm:p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E6D8] text-[#A88249]"><CalendarDays size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#7D7467] sm:text-sm">Próximo evento</p>
          <p className="truncate text-base font-semibold text-[#1F1F1F] sm:text-lg">{nextEvent ? nextEvent.title : "Sin eventos próximos"}</p>
          {nextEvent && <p className="mt-0.5 text-xs text-[#7D7467]">{formatDate(nextEvent.event_date)}</p>}
        </div>
      </div>
    </section>
  );
}
