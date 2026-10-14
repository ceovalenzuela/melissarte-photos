"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Shirt, ArrowUpRight } from "lucide-react";
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

function mapsUrl(place?: string, address?: string) {
  const query = [place, address].filter((value) => value?.trim()).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
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
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;
  const templateKey = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"].includes(invitation.template_key) ? invitation.template_key : "wedding_editorial";
  const templateClass = `invitation-template-${templateKey}`;
  const dateLabel = formatDate(invitation.event_date);
  const primaryMapsUrl = mapsUrl(content.ceremony_venue, content.ceremony_address);
  const receptionMapsUrl = mapsUrl(content.reception_venue, content.reception_address);
  const religiousCeremonyMapsUrl = mapsUrl(content.religious_ceremony_venue, content.religious_ceremony_address);

  const [guestName, setGuestName] = useState(existingRSVP?.guest_name ?? "");
  const [attendance, setAttendance] = useState<RSVPStatus>(existingRSVP?.attendance_status ?? "attending");
  const [partySize, setPartySize] = useState(existingRSVP?.attendance_status === "attending" ? existingRSVP.party_size : 1);
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
        if (data !== true) throw new Error("El enlace para editar tu confirmación ya no está disponible.");
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
        const params = new URLSearchParams({ rsvp: result.response_id, token: result.edit_token });
        window.location.href = `/i/${encodeURIComponent(invitation.invitation_slug)}?${params.toString()}`;
        return;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error al guardar tu confirmación.");
    } finally {
      setSubmitting(false);
    }
  }

  if (editRequested && !existingRSVP) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-12" style={{ backgroundColor: background, color: textColor }}>
        <section className="w-full max-w-lg rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-xl">
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: accent }}>Invitación digital</p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl">Este enlace ya no está disponible</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Revisa que hayas abierto el enlace completo que recibiste.</p>
          <a href={`/i/${encodeURIComponent(invitation.invitation_slug)}#confirmar`} className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>Volver a la invitación</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden" style={{ backgroundColor: background, color: textColor }}>
      <div className="mx-auto max-w-7xl sm:px-6 sm:py-8 lg:px-8">
        <article className={`invitation-public ${templateClass} overflow-hidden shadow-[0_28px_100px_rgba(48,36,27,0.12)] sm:rounded-[2rem]`} style={{ backgroundColor: background, color: textColor }}>
          <header className={`invitation-hero relative isolate flex min-h-[58svh] items-end overflow-hidden sm:min-h-[680px] lg:min-h-[800px] ${cover ? "invitation-hero-has-cover" : "invitation-hero-no-cover"}`}>
            {cover ? (
              <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center invitation-hero-image" style={{ backgroundImage: `url("${cover.replace(/["\\\\]/g, "")}")` }} />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-20 invitation-hero-placeholder" style={{ background: `radial-gradient(ellipse at 75% 18%, ${accent}55, transparent 38%), linear-gradient(145deg, ${background} 0%, ${accent} 100%)` }} />
            )}
            {cover && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/10" />}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-60" />
          </header>
          <section id="detalles" className="px-5 py-12 sm:px-12 sm:py-16 lg:px-20 invitation-reveal">
            <div className="mx-auto max-w-3xl text-center invitation-reveal">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Reserva la fecha</p>
              <h1 className="invitation-title mt-4 text-balance font-[var(--font-display)] text-4xl leading-tight sm:text-6xl">{content.headline || invitation.event_title}</h1>
              {content.introduction && <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">{content.introduction}</p>}
              <div className="mx-auto mt-5 flex items-center justify-center gap-4">
                <span className="h-px w-10" style={{ backgroundColor: `${accent}55` }} />
                <CalendarDays size={20} strokeWidth={1.4} style={{ color: accent }} />
                <span className="h-px w-10" style={{ backgroundColor: `${accent}55` }} />
              </div>
              {dateLabel && <p className="mt-5 font-[var(--font-display)] text-3xl capitalize leading-tight sm:text-4xl">{dateLabel}</p>}
              {invitation.event_date && <Countdown eventDate={invitation.event_date} eventTime={content.ceremony_time} accent={accent} textColor={textColor} background={background} />}
              
            </div>

            {(content.ceremony_venue || content.ceremony_time || content.ceremony_address || content.reception_venue || content.reception_time || content.reception_address) && (
              <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
                {(content.ceremony_venue || content.ceremony_time || content.ceremony_address) && (
                  <LocationCard title={content.reception_venue ? "Celebración" : "Lugar del evento"} time={content.ceremony_time} venue={content.ceremony_venue} address={content.ceremony_address} maps={primaryMapsUrl} accent={accent} />
                )}
                {(content.reception_venue || content.reception_time || content.reception_address) && (
                  <LocationCard title="Recepción" time={content.reception_time} venue={content.reception_venue} address={content.reception_address} maps={receptionMapsUrl} accent={accent} />
                )}
              </div>
            )}

            {content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address) && <div className="mx-auto mt-5 max-w-4xl"><LocationCard title="Ceremonia religiosa" time={content.religious_ceremony_time} venue={content.religious_ceremony_venue} address={content.religious_ceremony_address} maps={religiousCeremonyMapsUrl} accent={accent} /></div>}

            {(content.dress_code || content.rsvp_deadline) && (
              <div className="mx-auto mt-5 grid max-w-4xl gap-4 sm:grid-cols-2">
                {content.dress_code && <InfoCard icon={<Shirt size={18} />} title="Código de vestimenta" value={content.dress_code} accent={accent} />}
                {content.rsvp_deadline && <InfoCard icon={<Clock3 size={18} />} title="Confirma antes de" value={formatDate(content.rsvp_deadline) ?? content.rsvp_deadline} accent={accent} />}
              </div>
            )}
          </section>

          {invitation.rsvp_enabled && (
            <section id="confirmar" className="scroll-mt-6 px-5 py-12 sm:px-12 sm:py-16 lg:px-20 invitation-reveal" style={{ background: `linear-gradient(135deg, ${accent}12, ${background})` }}>
              <div className="mx-auto max-w-xl">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{existingRSVP ? "Tu respuesta" : "Nos encantará saber de ti"}</p>
                <h2 className="mt-3 text-center font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">{existingRSVP ? "Tu confirmación" : "¿Nos acompañas?"}</h2>
                <p className="mt-3 text-center text-sm leading-6 text-neutral-600">{existingRSVP ? "Puedes actualizar tus datos aquí." : "Solo te tomará unos segundos confirmar."}</p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-[0_16px_50px_rgba(48,36,27,0.06)] sm:p-7">
                  <div>
                    <label htmlFor="guest-name" className="mb-2 block text-sm font-medium">Nombre completo</label>
                    <input id="guest-name" required minLength={1} maxLength={80} value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 outline-none transition focus:border-neutral-400" placeholder="Escribe tu nombre" />
                  </div>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">¿Podrás acompañarnos?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setAttendance("attending")} aria-pressed={attendance === "attending"} className="rounded-xl border px-3 py-3.5 text-sm transition" style={attendance === "attending" ? { borderColor: accent, backgroundColor: `${accent}12`, color: accent } : { borderColor: "#e5e5e5" }}>Sí, asistiré</button>
                      <button type="button" onClick={() => setAttendance("declined")} aria-pressed={attendance === "declined"} className="rounded-xl border px-3 py-3.5 text-sm transition" style={attendance === "declined" ? { borderColor: accent, backgroundColor: `${accent}12`, color: accent } : { borderColor: "#e5e5e5" }}>No podré asistir</button>
                    </div>
                  </fieldset>
                  {attendance === "attending" && <div>
                    <label htmlFor="party-size" className="mb-2 block text-sm font-medium">Personas en total</label>
                    <select id="party-size" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none focus:border-neutral-400">
                      {Array.from({ length: invitation.max_party_size }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? "persona" : "personas"}</option>)}
                    </select>
                  </div>}
                  <div>
                    <label htmlFor="guest-phone" className="mb-2 block text-sm font-medium">Teléfono <span className="font-normal text-neutral-400">(opcional)</span></label>
                    <input id="guest-phone" type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 outline-none transition focus:border-neutral-400" placeholder="Tu número de contacto" />
                  </div>
                  {errorMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
                  {successMessage && <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={18} />{successMessage}</p>}
                  <button type="submit" disabled={submitting} className="w-full rounded-full px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accent }}>{submitting ? "Guardando..." : existingRSVP ? "Guardar cambios" : "Confirmar asistencia"}</button>
                  {!existingRSVP && <p className="text-center text-xs leading-5 text-neutral-400">Tu respuesta solo será visible para quienes organizan el evento.</p>}
                </form>
              </div>
            </section>
          )}

          <footer className="px-6 py-10 text-center sm:py-12">
            <div className="mx-auto mb-5 h-px w-10" style={{ backgroundColor: `${accent}66` }} />
            <p className="font-[var(--font-display)] text-2xl italic" style={{ color: accent }}>{content.host_names || "Con cariño"}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-neutral-400">Gracias por ser parte de este día</p>
            <p className="mt-8 border-t border-black/5 pt-5 text-[10px] font-medium uppercase tracking-[0.28em]" style={{ color: accent }}>Melissarte Invitaciones</p>
          </footer>
        </article>
      </div>
    </main>
  );
}

function Countdown({ eventDate, eventTime, accent, textColor, background }: { eventDate: string; eventTime?: string; accent: string; textColor: string; background: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(`${eventDate}T${eventTime || "00:00"}:00`).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [eventDate, eventTime]);
  if (remaining === null || remaining <= 0) return null;
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const parts = [{ value: days, label: "días" }, { value: hours, label: "horas" }, { value: minutes, label: "min" }];
  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border px-5 py-4 sm:px-7 sm:py-5" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0A`, color: textColor }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>La cuenta regresiva ha comenzado</p>
      <div className="mt-4 grid grid-cols-3 divide-x" style={{ borderColor: `${accent}30` }}>
        {parts.map((part) => <div key={part.label} className="px-2 text-center"><p className="font-[var(--font-display)] text-3xl tabular-nums sm:text-4xl">{String(part.value).padStart(2, "0")}</p><p className="mt-1 text-[10px] uppercase tracking-[0.18em] opacity-70">{part.label}</p></div>)}
      </div>
    </div>
  );
}

function LocationCard({ title, time, venue, address, maps, accent }: { title: string; time?: string; venue?: string; address?: string; maps: string | null; accent: string }) {
  return (
    <article className="rounded-[1.5rem] border border-neutral-100 bg-[#FEFDFC] p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}14`, color: accent }}><MapPin size={19} strokeWidth={1.6} /></span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>{title}</p>
      </div>
      {time && <p className="mt-5 font-[var(--font-display)] text-3xl font-medium leading-none sm:text-4xl">{time}</p>}
      {venue && <h3 className="mt-3 font-[var(--font-display)] text-2xl leading-tight">{venue}</h3>}
      {address && <p className="mt-2 text-sm leading-6 text-neutral-600">{address}</p>}
      {maps && <a href={maps} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-50" style={{ borderColor: `${accent}55`, color: accent }}>Ver ubicación <ArrowUpRight size={15} /></a>}
    </article>
  );
}

function InfoCard({ icon, title, value, accent }: { icon: React.ReactNode; title: string; value: string; accent: string }) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-white p-5">
      <span className="mt-0.5" style={{ color: accent }}>{icon}</span>
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</p><p className="mt-2 text-sm leading-6 text-neutral-700">{value}</p></div>
    </article>
  );
}
