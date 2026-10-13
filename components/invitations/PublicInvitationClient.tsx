"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Shirt } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PublicInvitation, RSVPResponse, RSVPStatus } from "@/types/invitation";

interface Props {
  invitation: PublicInvitation;
  existingRSVP: RSVPResponse | null;
  editToken: string | null;
  editRequested: boolean;
}

function safeColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PublicInvitationClient({
  invitation,
  existingRSVP,
  editToken,
  editRequested,
}: Props) {
  const content = invitation.content_config ?? {};
  const design = invitation.design_config ?? {};
  const accent = safeColor(design.accent_color, "#9A7358");
  const textColor = safeColor(design.text_color, "#332B27");
  const background = safeColor(design.background_color, "#FBF7F1");
  const cover = design.cover_image_url?.startsWith("https://")
    ? design.cover_image_url
    : invitation.cover_image;
  const dateLabel = formatDate(invitation.event_date);

  const [guestName, setGuestName] = useState(existingRSVP?.guest_name ?? "");
  const [attendance, setAttendance] = useState<RSVPStatus>(
    existingRSVP?.attendance_status ?? "attending"
  );
  const [partySize, setPartySize] = useState(
    existingRSVP?.attendance_status === "attending"
      ? existingRSVP.party_size
      : 1
  );
  const [phone, setPhone] = useState(existingRSVP?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      if (existingRSVP && editToken) {
        const { data, error } = await supabase.rpc("edit_invitation_rsvp", {
          p_response_id: existingRSVP.response_id,
          p_edit_token: editToken,
          p_guest_name: guestName.trim(),
          p_attendance_status: attendance,
          p_party_size: attendance === "attending" ? partySize : 0,
          p_phone: phone.trim() || null,
        });
        if (error) throw error;
        if (data !== true) throw new Error("El enlace de edición no es válido o ya no está disponible.");
        setSuccessMessage("Tu confirmación se actualizó correctamente.");
      } else {
        const { data, error } = await supabase.rpc("submit_invitation_rsvp", {
          p_invitation_slug: invitation.invitation_slug,
          p_guest_name: guestName.trim(),
          p_attendance_status: attendance,
          p_party_size: attendance === "attending" ? partySize : 0,
          p_phone: phone.trim() || null,
        });
        if (error) throw error;
        const result = data?.[0] as { response_id?: string; edit_token?: string } | undefined;
        if (!result?.response_id || !result?.edit_token) {
          throw new Error("No fue posible guardar tu confirmación. Inténtalo de nuevo.");
        }
        const params = new URLSearchParams({
          rsvp: result.response_id,
          token: result.edit_token,
        });
        window.location.href = `/i/${encodeURIComponent(invitation.invitation_slug)}?${params.toString()}`;
        return;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar tu confirmación."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (editRequested && !existingRSVP) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-12" style={{ backgroundColor: background, color: textColor }}>
        <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-[var(--font-display)] text-3xl">Enlace no disponible</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            No pudimos validar el enlace para editar la confirmación. Revisa que hayas abierto el enlace completo que recibiste.
          </p>
          <a href={`/i/${encodeURIComponent(invitation.invitation_slug)}#confirmar`} className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium text-white" style={{ backgroundColor: accent }}>
            Volver a la invitación
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-8" style={{ backgroundColor: background, color: textColor }}>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(48,36,27,0.10)]">
        <header className="relative flex min-h-[320px] items-end overflow-hidden px-6 pb-8 pt-16 sm:min-h-[440px] sm:px-12 sm:pb-12">
          {cover ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(to top, rgba(23,19,16,.82), rgba(23,19,16,.04) 78%), url("${cover.replace(/["\\\\]/g, "")}")` }}
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at top right, ${accent}33, transparent 48%), linear-gradient(135deg, ${background}, #ffffff)` }} />
          )}
          <div className="relative z-10 w-full text-center text-white">
            {content.host_names && <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/85">{content.host_names}</p>}
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/80">Tenemos el gusto de invitarte</p>
            <h1 className="mx-auto max-w-2xl text-balance font-[var(--font-display)] text-5xl font-medium leading-[0.95] sm:text-7xl">
              {content.headline || invitation.event_title}
            </h1>
            {content.subtitle && <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90 sm:text-base">{content.subtitle}</p>}
          </div>
        </header>

        <section className="px-6 py-8 text-center sm:px-12 sm:py-10">
          {content.introduction && <p className="mx-auto max-w-xl whitespace-pre-line text-sm leading-7 text-neutral-600 sm:text-base">{content.introduction}</p>}
          {dateLabel && (
            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm capitalize" style={{ backgroundColor: `${accent}14`, color: accent }}>
              <CalendarDays size={17} />
              {dateLabel}
            </div>
          )}
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {(content.ceremony_venue || content.ceremony_time || content.ceremony_address) && (
              <DetailCard icon={<MapPin size={18} />} title="Ceremonia" lines={[content.ceremony_time, content.ceremony_venue, content.ceremony_address]} accent={accent} />
            )}
            {(content.reception_venue || content.reception_time || content.reception_address) && (
              <DetailCard icon={<MapPin size={18} />} title="Recepción" lines={[content.reception_time, content.reception_venue, content.reception_address]} accent={accent} />
            )}
            {content.dress_code && <DetailCard icon={<Shirt size={18} />} title="Código de vestimenta" lines={[content.dress_code]} accent={accent} />}
            {content.rsvp_deadline && <DetailCard icon={<Clock3 size={18} />} title="Confirma antes de" lines={[content.rsvp_deadline]} accent={accent} />}
          </div>
          {content.closing_note && <p className="mx-auto mt-8 max-w-xl font-[var(--font-display)] text-2xl italic">{content.closing_note}</p>}
        </section>

        {invitation.rsvp_enabled && (
          <section id="confirmar" className="border-t border-neutral-100 px-6 py-8 sm:px-12 sm:py-10">
            <div className="mx-auto max-w-xl">
              <p className="text-center text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
                {existingRSVP ? "Tu respuesta" : "Nos encantará saber de ti"}
              </p>
              <h2 className="mt-2 text-center font-[var(--font-display)] text-3xl sm:text-4xl">
                {existingRSVP ? "Editar confirmación" : "¿Nos acompañas?"}
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-500">
                {existingRSVP ? "Actualiza los datos de tu respuesta." : "Confirma tu asistencia en unos segundos."}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="guest-name" className="mb-2 block text-sm font-medium">Nombre completo</label>
                  <input id="guest-name" required minLength={1} maxLength={80} value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-400" placeholder="Escribe tu nombre" />
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">¿Podrás acompañarnos?</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAttendance("attending")} aria-pressed={attendance === "attending"} className="rounded-xl border px-3 py-3 text-sm transition" style={attendance === "attending" ? { borderColor: accent, backgroundColor: `${accent}12`, color: accent } : { borderColor: "#e5e5e5" }}>Sí, asistiré</button>
                    <button type="button" onClick={() => setAttendance("declined")} aria-pressed={attendance === "declined"} className="rounded-xl border px-3 py-3 text-sm transition" style={attendance === "declined" ? { borderColor: accent, backgroundColor: `${accent}12`, color: accent } : { borderColor: "#e5e5e5" }}>No podré asistir</button>
                  </div>
                </fieldset>
                {attendance === "attending" && (
                  <div>
                    <label htmlFor="party-size" className="mb-2 block text-sm font-medium">¿Cuántas personas asistirán contigo?</label>
                    <select id="party-size" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-400">
                      {Array.from({ length: invitation.max_party_size }, (_, index) => index + 1).map((size) => (
                        <option key={size} value={size}>{size} {size === 1 ? "persona en total" : "personas en total"}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="guest-phone" className="mb-2 block text-sm font-medium">Teléfono <span className="font-normal text-neutral-400">(opcional)</span></label>
                  <input id="guest-phone" type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-400" placeholder="Tu número de contacto" />
                </div>
                {errorMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
                {successMessage && <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={18} />{successMessage}</p>}
                <button type="submit" disabled={submitting} className="w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {submitting ? "Guardando..." : existingRSVP ? "Guardar cambios" : "Confirmar respuesta"}
                </button>
                {!existingRSVP && <p className="text-center text-xs leading-5 text-neutral-400">Tu respuesta solo será visible para los organizadores.</p>}
              </form>
            </div>
          </section>
        )}

        <footer className="border-t border-neutral-100 px-6 py-6 text-center">
          <p className="font-[var(--font-display)] text-lg italic" style={{ color: accent }}>Con cariño, esperamos verte</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-neutral-400">Invitación digital · Melissarte</p>
        </footer>
      </div>
    </main>
  );
}

function DetailCard({
  icon,
  title,
  lines,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  lines: (string | undefined)[];
  accent: string;
}) {
  const visibleLines = lines.filter((line): line is string => Boolean(line?.trim()));
  return (
    <article className="rounded-2xl border border-neutral-100 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-1">
        {visibleLines.map((line, index) => <p key={index} className="text-sm leading-6 text-neutral-600">{line}</p>)}
      </div>
    </article>
  );
}
