import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import EventEditor from "@/components/events/EventEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading event:", error);
    notFound();
  }

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/admin"
        className="
          mb-6
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-[#7D7467]
          transition-colors
          duration-200
          hover:text-[#1F1F1F]
        "
      >
        <ArrowLeft size={18} />
        Volver a galerías
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F]">
          {event.title}
        </h1>

        <p className="mt-2 text-[#7D7467]">
          Edita la información del evento y su contenido.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <EventEditor event={event} />
      </div>
    </main>
  );
}