"use client";

import AppHeader from "@/components/layout/AppHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import EventCard from "@/components/events/EventCard";
import EventDialog from "@/components/events/EventDialog";

import { useEvents } from "@/hooks/useEvents";

export default function AdminPage() {
  const {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader title="Galerías">
        <EventDialog
          mode="create"
          createEvent={createEvent}
          updateEvent={updateEvent}
          loading={loading}
        />
      </AppHeader>

      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <StatsCards totalEvents={events.length} />

        <section className="space-y-4">
          {events.map((event) => (
<EventCard
  key={event.id}
  event={event}
  onEdit={() => {}}
  onDelete={() => deleteEvent(event.id)}
/>
          ))}
        </section>
      </div>
    </main>
  );
}