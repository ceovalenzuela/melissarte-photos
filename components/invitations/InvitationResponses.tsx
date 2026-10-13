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

  const loadResponses = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_invitation_rsvps_with_token", {
      p_event_id: eventId,
      p_organizer_token: organizerToken,
    });
    if (error) {
      console.error("Error cargando respuestas RSVP:", error);
      toast.error("No fue posible cargar las confirmaciones.");
      setLoading(false);
      return;
    }
    setResponses((data ?? []) as RSVPRow[]);
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
    <section className="mt-5 overflow-hidden rounded-3xl border border-[#E7DCC8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E8DC] px-5 py-4 sm:px-7">
        <div>
          <h3 className="font-[var(--font-display)] text-2xl text-[#332B27]">Lista de invitados</h3>
          <p className="mt-1 text-sm text-[#7D7467]">Respuestas recibidas y número de asistentes.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); void loadResponses(); }} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#E7DCC8] px-4 py-2 text-sm text-[#5C554B] disabled:opacity-50">
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
        <div className="mb-4 flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-[#332B27]">Detalle de respuestas</h4><span className="text-xs text-[#8A8074]">Más recientes primero</span></div>
        {loading ? (
          <p className="py-5 text-center text-sm text-[#8A8074]">Cargando respuestas...</p>
        ) : responses.length === 0 ? (
          <p className="rounded-2xl bg-[#FDFBF8] px-4 py-6 text-center text-sm leading-6 text-[#8A8074]">
            Aún no hay respuestas. Cuando publiques la invitación y tus invitados confirmen, aparecerán aquí.
          </p>
        ) : (
          <div className="space-y-3">
            {responses.map((response) => (
              <article key={response.response_id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#F0E8DC] bg-white p-4 transition-colors hover:bg-[#FDFBF8] sm:p-5">
                <div>
                  <p className="font-medium text-[#332B27]">{response.guest_name}</p>
                  <p className="mt-1 text-xs text-[#8A8074]">
                    {new Date(response.created_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {response.phone && <a href={`tel:${response.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#7D7467] hover:text-[#332B27]"><Phone size={13} />{response.phone}</a>}
                </div>
                <div className="text-right">
                  <span className={response.attendance_status === "attending" ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800" : "inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"}>
                    {response.attendance_status === "attending" ? "Asistirá" : "No asistirá"}
                  </span>
                  <p className="mt-2 text-sm text-[#5C554B]">
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
    <div className="rounded-2xl bg-[#FDFBF8] p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-[#A88249]">{icon}<span className="text-xs text-[#7D7467] sm:text-sm">{label}</span></div>
      <p className="mt-2 text-2xl font-semibold text-[#332B27]">{value}</p>
    </div>
  );
}
