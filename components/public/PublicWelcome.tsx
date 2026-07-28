import { Heart } from "lucide-react";
import { Event } from "@/types/event";

interface PublicWelcomeProps {
  event: Event;
}

export default function PublicWelcome({
  event,
}: PublicWelcomeProps) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <Heart className="h-6 w-6 text-rose-500" />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900">
        ¡Bienvenidos!
      </h2>

      <div className="mt-4 space-y-4 text-[15px] leading-7 text-neutral-600">
        {event.welcome_message ? (
          <p>{event.welcome_message}</p>
        ) : (
          <>
            <p>
              Gracias por acompañarnos en este día tan especial.
            </p>

            <p>
              Comparte las fotografías que tomes durante el evento
              para crear un álbum lleno de recuerdos que todos
              podremos disfrutar.
            </p>
          </>
        )}
      </div>
    </section>
  );
}