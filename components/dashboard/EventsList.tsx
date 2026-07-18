import { Event } from "@/types/event";
import EventCard from "@/components/events/EventCard";

type Props = {
  events: Event[];
};

export default function EventsList({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-gray-500">
        No hay eventos todavía.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}