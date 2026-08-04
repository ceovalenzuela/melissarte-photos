import { EventWithStats } from "@/types/event-with-stats";
import EventsList from "./EventsList";

type Props = {
  events: EventWithStats[];
};

export default function Dashboard({ events }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            📷 MelissArte Photos
          </h1>

          <p className="text-muted-foreground mt-2">
            Administra todos tus eventos.
          </p>
        </div>
      </div>

      <EventsList events={events} />
    </div>
  );
}