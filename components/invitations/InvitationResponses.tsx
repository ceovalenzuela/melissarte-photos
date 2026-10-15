"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users, UserCheck, UserX, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RSVPRow {
  response_id: string;
  guest_name: string;
  attendance_status: "attending" | "declined";
  party_size: number;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  eventId: string;
  organizerToken: string;
}

export default function InvitationResponses({ eventId, organizerToken }: Props) {
  const [responses, setResponses] = useState<RSVPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadResponses = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_invitation_rsvps_with_token", {
      p_event_id: eventId,
      p_organizer_token: organizerToken,
    });
    if (error) {
      console.error("Error cargando respuestas RSVP:", error);
      setLoadError(true);
      toast.error("No pudimos cargar las confirmaciones. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }
    setResponses(((data ?? []) as RSVPRow[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoadError(false);
    setLoading(false);
  }, [eventId, organizerToken]);

  useEffect(() => {
    // The callback updates state only after its asynchronous Supabase request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadResponses();
  }, [loadResponses]);

  const attending = responses.filter((response) => response.attendance_status === "attending");
  const declined = responses.filter((response) => response.attendance_status === "declined");
  const peopleCount = attending.reduce((total, response) => total + response.party_size, 0);

  return (
    <section className="organizer-rsvp-list mt-5 overflow-hidden rounded-3xl border bg-white">
      <div className="organizer-rsvp-list-header flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-7">
        <div>
          <h3 className="organizer-rsvp-heading font-[var(--font-display)] text-2xl">Lista de invitados</h3>
          <p className="organizer-rsvp-muted mt-1 text-sm">Respuestas recibidas y número de asistentes.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); void loadResponses(); }} disabled={loading} className="organizer-rsvp-refresh inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 sm:gap-3 sm:p-6">
        <Summary icon={<Users size={17} />} label="Respuestas" value={responses.length} />
        <Summary icon={<UserCheck size={17} />} label="Sí asistirán" value={attending.length} />
        <Summary icon={<UserX size={17} />} label="No asistirán" value={declined.length} />
        <Summary icon={<Users size={17} />} label="Personas confirmadas" value={peopleCount} />
      </div>
      <div className="px-5 pb-5 sm:px-7 sm:pb-7">
        <div className="mb-4 flex items-center justify-between gap-3"><h4 className="organizer-rsvp-heading text-sm font-semibold">Detalle de respuestas</h4><span className="organizer-rsvp-muted text-xs">Más recientes primero</span></div>
        {loading ? (
          <p className="organizer-rsvp-muted py-5 text-center text-sm">Cargando respuestas...</p>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="font-medium text-red-900">No pudimos cargar las confirmaciones</p>
            <p className="mt-1 text-sm leading-6 text-red-800">Esto no significa que la lista esté vacía. Comprueba tu conexión y vuelve a intentarlo.</p>
            <button type="button" onClick={() => { setLoading(true); void loadResponses(); }} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100">Volver a intentar</button>
          </div>
        ) : responses.length === 0 ? (
          <p className="organizer-rsvp-empty rounded-2xl px-4 py-6 text-center text-sm leading-6">
            Aún no hay respuestas. Cuando tus invitados confirmen su asistencia, aparecerán aquí.
          </p>
        ) : (
          <div className="space-y-3">
            {responses.map((response) => (
              <article key={response.response_id} className="organizer-rsvp-response flex flex-wrap items-start justify-between gap-3 rounded-2xl border bg-white p-4 transition-colors sm:p-5">
                <div>
                  <p className="organizer-rsvp-heading font-medium">{response.guest_name}</p>
                  <p className="organizer-rsvp-muted mt-1 text-xs">
                    {new Date(response.created_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {response.phone && <a href={`tel:${response.phone}`} className="organizer-rsvp-phone mt-2 inline-flex items-center gap-1.5 text-sm"><Phone size={13} />{response.phone}</a>}
                </div>
                <div className="text-right">
                  <span className={response.attendance_status === "attending" ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800" : "inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"}>
                    {response.attendance_status === "attending" ? "Asistirá" : "No asistirá"}
                  </span>
                  <p className="organizer-rsvp-muted mt-2 text-sm">
                    {response.attendance_status === "attending" ? `${response.party_size} ${response.party_size === 1 ? "persona" : "personas"}` : "0 asistentes"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="organizer-rsvp-summary rounded-2xl p-3 sm:p-4">
      <div className="organizer-rsvp-summary-accent flex items-center gap-1.5">{icon}<span className="organizer-rsvp-muted text-xs sm:text-sm">{label}</span></div>
      <p className="organizer-rsvp-heading mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
