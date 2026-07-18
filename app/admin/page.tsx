"use client";

import AppHeader from "@/components/layout/AppHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { useEvents } from "@/hooks/useEvents";

export default function AdminPage() {
  const { events, createEvent } = useEvents();

  async function handleCreateEvent(title: string, eventDate: string) {
    try {
      await createEvent(title, eventDate);
    } catch (error) {
      console.error(error);
      alert("No fue posible crear el evento.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader title="Dashboard">
        <EventForm onCreate={handleCreateEvent} />
      </AppHeader>

      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <StatsCards totalEvents={events.length} />

        <section className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.event_date ?? "Sin fecha"}
              slug={event.slug}
            />
          ))}
        </section>
      </div>
    </main>
  );
}