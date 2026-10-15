"use client";

import { FormEvent, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Shirt, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { InvitationTemplateKey, PublicInvitation, RSVPResponse, RSVPStatus } from "@/types/invitation";

interface PersonalizedGuest {
  guest_id: string;
  guest_name: string;
  phone: string;
  passes: number;
  response_id: string | null;
  attendance_status: RSVPStatus | null;
  party_size: number | null;
}
interface Props {
  invitation: PublicInvitation;
  existingRSVP: RSVPResponse | null;
  editToken: string | null;
  editRequested: boolean;
  personalizedGuest?: PersonalizedGuest | null;
  personalizedToken?: string | null;
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

function formatTime(value?: string) {
  if (!value) return null;
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return { hour: String(hour12), minute, suffix };
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
  personalizedGuest = null,
  personalizedToken = null,
}: Props) {
  const router = useRouter();
  const content = invitation.content_config ?? {};
  const design = invitation.design_config ?? {};
  const background = safeColor(design.background_color, "#FBF7F1");
  const accent = safeColor(design.accent_color, "#9A7358");
  const textColor = safeColor(design.text_color, "#332B27");
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;
  const templateKeys: InvitationTemplateKey[] = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"];
  const templateKey: InvitationTemplateKey = templateKeys.includes(invitation.template_key as InvitationTemplateKey)
    ? (invitation.template_key as InvitationTemplateKey)
    : "wedding_editorial";
  const templateClass = `invitation-template-${templateKey}`;
  const templateDefaults = ({
    wedding_editorial: { title: "#273747", card: "#FFFCF6", cardText: "#302F30", border: "#C9AD6B", button: "#A78645", buttonText: "#FFFFFF", rsvp: "#273747", rsvpText: "#FFFAF0", form: "#FFFDF8", formText: "#302F30" },
    xv_gala: { title: "#FFFAF0", card: "#39304C", cardText: "#FFFAF0", border: "#D6B66F", button: "#6F4B68", buttonText: "#FFFFFF", rsvp: "#211B35", rsvpText: "#FFFAF0", form: "#FFFDF9", formText: "#30283A" },
    baby_soft: { title: "#875744", card: "#FFFEFA", cardText: "#493C32", border: "#E5C5B2", button: "#A96149", buttonText: "#FFFFFF", rsvp: "#F6E7D9", rsvpText: "#493C32", form: "#FFFEFA", formText: "#493C32" },
    baptism_light: { title: "#263641", card: "#FFFFFF", cardText: "#263641", border: "#C7DBE5", button: "#527F98", buttonText: "#FFFFFF", rsvp: "#E3EEF3", rsvpText: "#263641", form: "#FFFFFF", formText: "#263641" },
  } satisfies Record<InvitationTemplateKey, { title: string; card: string; cardText: string; border: string; button: string; buttonText: string; rsvp: string; rsvpText: string; form: string; formText: string }>)[templateKey];
  const dateLabel = formatDate(invitation.event_date);
  const todayInMonterrey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Monterrey",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const rsvpDeadlinePassed = Boolean(
    content.rsvp_deadline &&
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(content.rsvp_deadline) &&
    todayInMonterrey > content.rsvp_deadline
  );
  const primaryMapsUrl = mapsUrl(content.ceremony_venue, content.ceremony_address);
  const receptionMapsUrl = mapsUrl(content.reception_venue, content.reception_address);
  const religiousCeremonyMapsUrl = mapsUrl(content.religious_ceremony_venue, content.religious_ceremony_address);
  const locationCount = [
    Boolean(content.ceremony_venue || content.ceremony_time || content.ceremony_address),
    Boolean(content.reception_venue || content.reception_time || content.reception_address),
    Boolean(content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address)),
  ].filter(Boolean).length;

  const [guestName, setGuestName] = useState(personalizedGuest?.guest_name ?? existingRSVP?.guest_name ?? "");
  const [attendance, setAttendance] = useState<RSVPStatus>(personalizedGuest?.attendance_status ?? existingRSVP?.attendance_status ?? "attending");
  const [partySize, setPartySize] = useState(personalizedGuest?.party_size ?? (existingRSVP?.attendance_status === "attending" ? existingRSVP.party_size : 1));
  const [phone] = useState(personalizedGuest?.phone ?? existingRSVP?.phone ?? "");
  const maxPartySize = personalizedGuest?.passes ?? invitation.max_party_size;
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  async function copyPersonalLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setErrorMessage("No se pudo copiar automáticamente. Puedes copiar el enlace desde la barra de direcciones.");
    }
  }

  function sharePersonalLink() {
    const message = `Aquí está mi enlace personal para consultar o editar mi confirmación de ${invitation.event_title}: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);
    try {
      if (personalizedGuest && personalizedToken) {
        const { data, error } = await supabase.rpc("submit_invitation_guest_rsvp", {
          p_invitation_slug: invitation.invitation_slug,
          p_guest_token: personalizedToken,
          p_guest_name: guestName.trim(),
          p_attendance_status: attendance,
          p_party_size: attendance === "attending" ? partySize : 0,
          p_phone: phone.trim() || null,
        });
        if (error) throw error;
        if (data !== true) throw new Error("No fue posible guardar tu confirmación. Verifica que el enlace siga vigente.");
        setSuccessMessage("Tu confirmación se guardó correctamente.");
      } else if (existingRSVP && editToken) {
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
        router.replace(`/i/${encodeURIComponent(invitation.invitation_slug)}?${params.toString()}#confirmar`, { scroll: false });
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
        <article
          className={`invitation-public ${templateClass} overflow-hidden shadow-[0_28px_100px_rgba(48,36,27,0.12)] sm:rounded-[2rem]`}
          style={{
            backgroundColor: background,
            color: textColor,
            "--inv-title": safeColor(design.title_color, templateDefaults.title),
            "--inv-card-bg": safeColor(design.card_background_color, templateDefaults.card),
            "--inv-card-text": safeColor(design.card_text_color, templateDefaults.cardText),
            "--inv-border": safeColor(design.border_color, templateDefaults.border),
            "--inv-button": safeColor(design.button_color, templateDefaults.button),
            "--inv-button-text": safeColor(design.button_text_color, templateDefaults.buttonText),
            "--inv-rsvp-bg": safeColor(design.rsvp_background_color, templateDefaults.rsvp),
            "--inv-rsvp-text": safeColor(design.rsvp_text_color, templateDefaults.rsvpText),
            "--inv-form-bg": safeColor(design.form_background_color, templateDefaults.form),
            "--inv-form-text": safeColor(design.form_text_color, templateDefaults.formText),
          } as CSSProperties}
        >
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
              {invitation.event_date && <Countdown eventDate={invitation.event_date} eventTime={content.ceremony_time} accent={accent} textColor={textColor} />}
              
            </div>

            {(content.ceremony_venue || content.ceremony_time || content.ceremony_address || content.reception_venue || content.reception_time || content.reception_address || (content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address))) && (
              <div className={`invitation-location-grid mx-auto mt-12 grid w-full items-stretch gap-4 ${locationCount === 2 ? "max-w-5xl md:grid-cols-2" : locationCount >= 3 ? "max-w-6xl md:grid-cols-2 xl:grid-cols-3" : "max-w-xl grid-cols-1"}`}>
                {content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address) && (
                  <LocationCard title="Ceremonia" time={content.religious_ceremony_time} venue={content.religious_ceremony_venue} address={content.religious_ceremony_address} maps={religiousCeremonyMapsUrl} accent={accent} />
                )}
                {(content.ceremony_venue || content.ceremony_time || content.ceremony_address) && (
                  <LocationCard title="Recepción" time={content.ceremony_time} venue={content.ceremony_venue} address={content.ceremony_address} maps={primaryMapsUrl} accent={accent} />
                )}
                {(content.reception_venue || content.reception_time || content.reception_address) && (
                  <LocationCard title="Celebración" time={content.reception_time} venue={content.reception_venue} address={content.reception_address} maps={receptionMapsUrl} accent={accent} />
                )}
              </div>
            )}

            {content.dress_code && !personalizedGuest && !existingRSVP && (
              <div className="mx-auto mt-5 max-w-sm">
                <div className="flex items-start gap-3 rounded-2xl border bg-white/90 p-4 text-left shadow-sm" style={{ borderColor: `${accent}30` }}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}><Shirt size={18} strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>Código de vestimenta</p>
                    <p className="mt-1.5 text-sm font-medium leading-5 text-neutral-700">{content.dress_code}</p>
                  </div>
                </div>
              </div>
            )}

          </section>

          {invitation.rsvp_enabled && Boolean((personalizedGuest && personalizedToken) || (existingRSVP && editToken)) && (rsvpDeadlinePassed ? (
            <section id="confirmar" className="invitation-rsvp scroll-mt-6 px-5 py-12 sm:px-12 sm:py-16 lg:px-20 invitation-reveal" style={{ background: `linear-gradient(135deg, ${accent}12, ${background})` }}>
              <div className="mx-auto max-w-xl rounded-[1.5rem] border border-black/5 bg-white p-6 text-center shadow-[0_16px_50px_rgba(48,36,27,0.06)] sm:p-8">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Confirmaciones cerradas</p>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl leading-tight sm:text-4xl">El plazo para confirmar terminó</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">La fecha límite fue el {formatDate(content.rsvp_deadline ?? null) ?? content.rsvp_deadline}. Ya no es posible enviar ni modificar confirmaciones.</p>
              </div>
            </section>
          ) : (
            <section id="confirmar" className="invitation-rsvp scroll-mt-6 px-5 py-12 sm:px-12 sm:py-16 lg:px-20 invitation-reveal" style={{ background: `linear-gradient(135deg, ${accent}12, ${background})` }}>
              <div className="mx-auto max-w-xl">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{existingRSVP || personalizedGuest?.attendance_status ? "Tu respuesta" : "Nos encantará saber de ti"}</p>
                <h2 className="mt-3 text-center font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">{existingRSVP || personalizedGuest?.attendance_status ? "Tu confirmación" : "¿Nos acompañas?"}</h2>
                <p className="mt-3 text-center text-sm leading-6 text-neutral-600">{existingRSVP || personalizedGuest?.attendance_status ? "Puedes actualizar tus datos aquí." : personalizedGuest ? `Esta invitación está preparada para ti. Tienes ${personalizedGuest.passes} ${personalizedGuest.passes === 1 ? "pase asignado" : "pases asignados"}.` : "Solo te tomará unos segundos confirmar."}</p>
                {(content.dress_code || content.rsvp_deadline) && (
                  <div className={`mx-auto mt-6 grid w-full gap-3 ${content.dress_code && content.rsvp_deadline ? "sm:grid-cols-2" : "max-w-sm grid-cols-1"}`}>
                    {content.dress_code && (
                      <div className="flex items-start gap-3 rounded-2xl border bg-white/90 p-4 text-left shadow-sm" style={{ borderColor: `${accent}30` }}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}><Shirt size={18} strokeWidth={1.7} /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>Código de vestimenta</p>
                          <p className="mt-1.5 text-sm font-medium leading-5 text-neutral-700">{content.dress_code}</p>
                        </div>
                      </div>
                    )}
                    {content.rsvp_deadline && (
                      <div className="flex items-start gap-3 rounded-2xl border bg-white/90 p-4 text-left shadow-sm" style={{ borderColor: `${accent}30` }}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}><Clock3 size={18} strokeWidth={1.7} /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>Fecha límite para confirmar</p>
                          <p className="mt-1.5 text-sm font-medium leading-5 text-neutral-700">{formatDate(content.rsvp_deadline) ?? content.rsvp_deadline}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {((existingRSVP && editToken) || (personalizedGuest && personalizedToken && (personalizedGuest.attendance_status || successMessage))) && (
                  <div className="personal-rsvp-link mt-7 overflow-hidden rounded-[1.5rem] border bg-white shadow-[0_12px_36px_rgba(48,36,27,0.07)]" style={{ borderColor: `${accent}44` }}>
                    <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}55, ${accent}, ${accent}55)` }} />
                    <div className="p-5 sm:p-6" style={{ background: `linear-gradient(145deg, ${accent}0A, #FFFFFF 68%)` }}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}18`, color: accent }}>
                        <CheckCircle2 size={20} />
                      </span>
                      <div>
                        <h3 className="personal-rsvp-link-title font-semibold">Este es tu enlace personal</h3>
                        <p className="personal-rsvp-link-copy mt-1 text-sm leading-6">Guárdalo para consultar o editar tu respuesta más adelante. Quien tenga este enlace podrá modificarla, así que compártelo solo contigo o con alguien de confianza.</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button type="button" onClick={copyPersonalLink} className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition hover:bg-white" style={{ borderColor: `${accent}66`, color: accent }}>
                        {linkCopied ? "Enlace copiado ✓" : "Guardar mi enlace"}
                      </button>
                      <button type="button" onClick={sharePersonalLink} className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: accent }}>
                        Compartir por WhatsApp
                      </button>
                    </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
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
                      {Array.from({ length: maxPartySize }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? "persona" : "personas"}</option>)}
                    </select>
                  </div>}
                  {errorMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
                  {successMessage && <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={18} />{successMessage}</p>}
                  <button type="submit" disabled={submitting} className="w-full rounded-full px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accent }}>{submitting ? "Guardando..." : existingRSVP || personalizedGuest?.attendance_status ? "Guardar cambios" : "Confirmar"}</button>
                  {!existingRSVP && <p className="text-center text-xs leading-5 text-neutral-400">Tu respuesta solo será visible para quienes organizan el evento.</p>}
                </form>
              </div>
            </section>
          ))}

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

function Countdown({ eventDate, eventTime, accent, textColor }: { eventDate: string; eventTime?: string; accent: string; textColor: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(`${eventDate}T${eventTime || "00:00"}:00`).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [eventDate, eventTime]);
  if (remaining === null || remaining <= 0) return null;
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  const parts = [{ value: days, label: "días" }, { value: hours, label: "horas" }, { value: minutes, label: "min" }, { value: seconds, label: "seg" }];
  return (
    <div className="invitation-countdown mx-auto mt-8 max-w-xl rounded-2xl border px-5 py-4 sm:px-7 sm:py-5" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0A`, color: textColor }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>La cuenta regresiva ha comenzado</p>
      <div className="mt-4 grid grid-cols-4 divide-x" style={{ borderColor: `${accent}30` }}>
        {parts.map((part) => <div key={part.label} className="px-2 text-center"><p className="font-[var(--font-display)] text-3xl tabular-nums sm:text-4xl">{String(part.value).padStart(2, "0")}</p><p className="mt-1 text-[10px] uppercase tracking-[0.18em] opacity-70">{part.label}</p></div>)}
      </div>
    </div>
  );
}

function LocationCard({ title, time, venue, address, maps, accent }: { title: string; time?: string; venue?: string; address?: string; maps: string | null; accent: string }) {
  return (
    <article className="invitation-location-card h-full rounded-[1.5rem] border border-neutral-100 bg-[#FEFDFC] p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}14`, color: accent }}><MapPin size={19} strokeWidth={1.6} /></span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>{title}</p>
      </div>
      {time && (() => {
        const formattedTime = formatTime(time);
        return formattedTime ? (
          <p className="mt-5 flex items-baseline font-[var(--font-display)] text-3xl font-medium leading-none sm:text-4xl">
            <span>{formattedTime.hour}:{formattedTime.minute}</span>
            <span className="ml-2 font-sans text-xs font-semibold tracking-[0.08em] sm:text-sm">{formattedTime.suffix}</span>
          </p>
        ) : (
          <p className="mt-5 font-[var(--font-display)] text-3xl font-medium leading-none sm:text-4xl">{time}</p>
        );
      })()}
      {venue && <h3 className="invitation-location-venue mt-3 font-[var(--font-display)] text-2xl leading-tight">{venue}</h3>}
      {address && <p className="invitation-location-address mt-2 text-sm leading-6 text-neutral-600">{address}</p>}
      {maps && <a href={maps} target="_blank" rel="noreferrer" className="invitation-location-button mt-4 inline-flex w-fit min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition hover:bg-neutral-50" style={{ borderColor: `${accent}55`, color: accent }}><span>Ver ubicación</span><ArrowUpRight size={15} className="shrink-0" /></a>}
    </article>
  );
}

