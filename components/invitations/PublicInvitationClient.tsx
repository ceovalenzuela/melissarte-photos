"use client";

import { FormEvent, useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, Shirt, Gift, ArrowUpRight, CalendarPlus, Church, PartyPopper, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { InvitationTemplateKey, PublicInvitation, RSVPResponse, RSVPStatus } from "@/types/invitation";
import { INVITATION_PALETTES } from "@/lib/invitation-palettes";

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

function defaultEventLabel(template: InvitationTemplateKey): string {
  if (template === "xv_gala") return "Mis XV";
  if (template === "baby_soft") return "Mi Baby";
  if (template === "baptism_light") return "Mi Bautizo";
  return "Boda";
}

function safeColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function resolveDesignColor(
  value: string | undefined,
  fallback: string,
  templateKey: InvitationTemplateKey,
  legacyWeddingColors: string[],
  modernWeddingColor: string,
) {
  const color = safeColor(value, fallback);
  // Migrate only known previous wedding defaults. Any genuinely customized color is preserved.
  if (templateKey === "wedding_editorial" && legacyWeddingColors.some((legacy) => color.toLowerCase() === legacy.toLowerCase())) {
    return modernWeddingColor;
  }
  return color;
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
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : null;
}

function safeExternalUrl(value?: string) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
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
  const [coverLoaded, setCoverLoaded] = useState(false);
  const content = invitation.content_config ?? {};
  const design = invitation.design_config ?? {};
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;

  useEffect(() => {
    setCoverLoaded(false);
    if (!cover) return;

    let active = true;
    const image = new window.Image();
    image.onload = () => {
      if (active) setCoverLoaded(true);
    };
    image.onerror = () => {
      if (active) setCoverLoaded(true);
    };
    image.src = cover;

    return () => {
      active = false;
    };
  }, [cover]);

  const templateKeys: InvitationTemplateKey[] = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"];
  const templateKey: InvitationTemplateKey = templateKeys.includes(invitation.template_key as InvitationTemplateKey)
    ? (invitation.template_key as InvitationTemplateKey)
    : "wedding_editorial";
  const templateClass = `invitation-template-${templateKey}`;
  const templatePalette = INVITATION_PALETTES[templateKey];
  const weddingColor = (value: string | undefined, fallback: string, oldColors: string[], newColor: string) =>
    resolveDesignColor(value, fallback, templateKey, oldColors, newColor);
  const background = weddingColor(design.background_color, templatePalette.background_color ?? "#F5F0E7", ["#F4EAD8", "#FFF7F0", "#F5F3EE"], "#F5F0E7");
  const accent = weddingColor(design.accent_color, templatePalette.accent_color ?? "#D5B77C", ["#87642F", "#D6A33D", "#344B61"], "#D5B77C");
  const textColor = weddingColor(design.text_color, templatePalette.text_color ?? "#282A2E", ["#273747", "#39252B", "#4D5357"], "#282A2E");
  const titleColor = weddingColor(design.title_color, templatePalette.title_color ?? "#111B29", ["#273747", "#702638", "#20272D"], "#111B29");
  const cardBackgroundColor = weddingColor(design.card_background_color, templatePalette.card_background_color ?? "#34465D", ["#FFFCF6", "#FFF7F0", "#EAE7DF", "#FFFFFF"], "#34465D");
  const cardTextColor = weddingColor(design.card_text_color, templatePalette.card_text_color ?? "#F5F0E7", ["#302F30", "#39252B", "#20272D"], "#F5F0E7");
  const borderColor = weddingColor(design.border_color, templatePalette.border_color ?? "#D5B77C", ["#C9AD6B", "#E5B84F", "#D9D8D1"], "#D5B77C");
  const buttonColor = weddingColor(design.button_color, templatePalette.button_color ?? "#D5B77C", ["#87642F", "#702638", "#344B61"], "#D5B77C");
  const buttonTextColor = weddingColor(design.button_text_color, templatePalette.button_text_color ?? "#111B29", ["#FFFFFF"], "#111B29");
  const rsvpBackgroundColor = weddingColor(design.rsvp_background_color, templatePalette.rsvp_background_color ?? "#111B29", ["#273747", "#F0D9D9", "#EAE7DF"], "#111B29");
  const rsvpTextColor = weddingColor(design.rsvp_text_color, templatePalette.rsvp_text_color ?? "#F5F0E7", ["#FFFAF0", "#39252B", "#20272D"], "#F5F0E7");
  const formBackgroundColor = weddingColor(design.form_background_color, templatePalette.form_background_color ?? "#FFFDF9", ["#FFFDF8", "#FFF7F0", "#FFFFFF"], "#FFFDF9");
  const formTextColor = weddingColor(design.form_text_color, templatePalette.form_text_color ?? "#282A2E", ["#302F30", "#39252B", "#20272D"], "#282A2E");
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

  const maxPartySize = Math.max(1, Math.min(20, personalizedGuest?.passes ?? invitation.max_party_size ?? 1));
  const initialPartySize = personalizedGuest?.attendance_status === "attending"
    ? personalizedGuest.party_size ?? 1
    : existingRSVP?.attendance_status === "attending"
      ? existingRSVP.party_size
      : 1;
  const [guestName, setGuestName] = useState(personalizedGuest?.guest_name ?? existingRSVP?.guest_name ?? "");
  const [attendance, setAttendance] = useState<RSVPStatus>(personalizedGuest?.attendance_status ?? existingRSVP?.attendance_status ?? "attending");
  const [partySize, setPartySize] = useState(Math.max(1, Math.min(maxPartySize, initialPartySize)));
  const [phone] = useState(personalizedGuest?.phone ?? existingRSVP?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  function calendarUrl(title: string, time?: string, venue?: string, address?: string) {
    if (!invitation.event_date || !/^\d{4}-\d{2}-\d{2}$/.test(invitation.event_date) || !time) return null;
    const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) return null;
    const [year, month, day] = invitation.event_date.split("-").map(Number);
    const pad = (value: number) => String(value).padStart(2, "0");
    const start = new Date(year, month - 1, day, Number(match[1]), Number(match[2]));
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const calendarDate = (date: Date) => String(date.getFullYear()) + pad(date.getMonth() + 1) + pad(date.getDate()) + "T" + pad(date.getHours()) + pad(date.getMinutes()) + "00";
    const location = [venue, address].filter(Boolean).join(", ");
    const details = [content.headline || invitation.event_title || "Evento", title, typeof window !== "undefined" ? window.location.href : ""].filter(Boolean).join("\n");
    const params = new URLSearchParams({ action: "TEMPLATE", text: (content.headline || invitation.event_title || "Evento") + " · " + title, dates: calendarDate(start) + "/" + calendarDate(end), details, ctz: "America/Monterrey" });
    if (location) params.set("location", location);
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }
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
    if (content.confirmation_mode === "whatsapp") {
      const destination = (content.whatsapp_confirmation_phone ?? "").replace(/\D/g, "");
      if (!destination) {
        setErrorMessage("La organización todavía no ha configurado el número de WhatsApp para recibir confirmaciones.");
        return;
      }
      const name = guestName.trim();
      if (!name) {
        setErrorMessage("Escribe tu nombre para continuar.");
        return;
      }
      const isAttending = attendance === "attending";
      const guests = isAttending ? partySize : 0;
      const eventName = content.headline || invitation.event_title || "el evento";
      const message = `Hola, quiero confirmar mi asistencia a ${eventName}.\nNombre: ${name}.\nAsistencia: ${isAttending ? "Sí asistiré" : "No podré asistir"}.\nNúmero de asistentes: ${guests}.`;
      window.open(`https://wa.me/${destination}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
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
          <a href={`/i/${encodeURIComponent(invitation.invitation_slug)}#confirmar`} className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: buttonColor, color: buttonTextColor }}>Volver a la invitación</a>
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
            "--inv-background": background,
            "--inv-accent": accent,
            "--inv-text": textColor,
            "--inv-title": titleColor,
            "--inv-card-bg": cardBackgroundColor,
            "--inv-card-text": cardTextColor,
            "--inv-border": borderColor,
            "--inv-button": buttonColor,
            "--inv-button-text": buttonTextColor,
            "--inv-rsvp-bg": rsvpBackgroundColor,
            "--inv-rsvp-text": rsvpTextColor,
            "--inv-form-bg": formBackgroundColor,
            "--inv-form-text": formTextColor,
          } as CSSProperties}
        >
          <header className={`invitation-hero relative isolate flex min-h-[58svh] items-end justify-center overflow-hidden px-6 pb-12 pt-16 text-center sm:min-h-[680px] sm:px-12 sm:pb-16 lg:min-h-[760px] ${cover ? "invitation-hero-has-cover" : "invitation-hero-no-cover"}`}>
            {cover ? (
              <div aria-hidden="true" className={`absolute inset-0 -z-20 bg-cover bg-center invitation-hero-image transition-all duration-[1200ms] ease-out motion-reduce:transition-none ${coverLoaded ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`} style={{ backgroundImage: `url("${cover.replace(/["\\\\]/g, "")}")` }} />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-20 invitation-hero-placeholder" style={{ background: `radial-gradient(ellipse at 75% 18%, ${accent}55, transparent 38%), linear-gradient(145deg, ${background} 0%, ${accent} 100%)` }} />
            )}
            <div aria-hidden="true" className="invitation-hero-overlay absolute inset-0 -z-10" />
            <div className="invitation-hero-frame pointer-events-none absolute inset-4 sm:inset-7" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-60" />
            <div className="invitation-hero-content invitation-hero-copy relative z-10 mx-auto max-w-4xl">
              {(content.event_label ?? defaultEventLabel(templateKey)).trim() && <p className="invitation-hero-event-label mb-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] sm:mb-2.5 sm:text-xs sm:tracking-[0.28em]" style={{ color: cover ? "#FFFAF2" : accent, textShadow: cover ? "0 1px 12px rgba(0,0,0,0.35)" : undefined }}>{(content.event_label ?? defaultEventLabel(templateKey)).trim()}</p>}
              <h1 className="invitation-hero-title font-[var(--font-display)] text-4xl leading-tight sm:text-6xl lg:text-7xl">{content.headline || invitation.event_title}</h1>
              {invitation.event_date && <p className="invitation-hero-date mt-5 text-xs font-semibold uppercase tracking-[0.22em] sm:mt-6 sm:text-sm sm:tracking-[0.24em] lg:text-base">{formatDate(invitation.event_date)}</p>}
            </div>

          </header>
          <section id="detalles" className={`invitation-details-section px-5 py-12 sm:px-12 sm:py-16 lg:px-20 ${templateKey === "wedding_editorial" ? "invitation-wedding-details" : ""}`}>
            <div className="invitation-intro-block mx-auto max-w-3xl text-center">
              {content.introduction && <p className="invitation-introduction mx-auto max-w-xl font-normal text-neutral-700">{content.introduction}</p>}
              <div className="invitation-details-heading">
                <span className="invitation-details-rule" aria-hidden="true" />
                <h2 className="invitation-details-title">Detalles del evento</h2>
              </div>
            </div>

            {(content.ceremony_venue || content.ceremony_time || content.ceremony_address || content.reception_venue || content.reception_time || content.reception_address || (content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address))) && (
              <div className={`invitation-location-grid mx-auto mt-12 grid w-full items-stretch gap-4 ${locationCount === 2 ? "max-w-5xl md:grid-cols-2" : locationCount >= 3 ? "max-w-6xl md:grid-cols-2 xl:grid-cols-3" : "max-w-xl grid-cols-1"}`}>
                {content.religious_ceremony_enabled && (content.religious_ceremony_time || content.religious_ceremony_venue || content.religious_ceremony_address) && (
                  <LocationCard title="Ceremonia" time={content.religious_ceremony_time} venue={content.religious_ceremony_venue} address={content.religious_ceremony_address} maps={religiousCeremonyMapsUrl} calendarUrl={calendarUrl("Ceremonia", content.religious_ceremony_time, content.religious_ceremony_venue, content.religious_ceremony_address)} accent={accent} />
                )}
                {(content.ceremony_venue || content.ceremony_time || content.ceremony_address) && (
                  <LocationCard title="Recepción" time={content.ceremony_time} venue={content.ceremony_venue} address={content.ceremony_address} maps={primaryMapsUrl} calendarUrl={calendarUrl("Recepción", content.ceremony_time, content.ceremony_venue, content.ceremony_address)} accent={accent} />
                )}
                {(content.reception_venue || content.reception_time || content.reception_address) && (
                  <LocationCard title="Celebración" time={content.reception_time} venue={content.reception_venue} address={content.reception_address} maps={receptionMapsUrl} calendarUrl={calendarUrl("Celebración", content.reception_time, content.reception_venue, content.reception_address)} accent={accent} />
                )}
              </div>
            )}

            {((content.dress_code && !personalizedGuest && !existingRSVP) || ((content.gift_message || content.gift_type || safeExternalUrl(content.gift_registry_url)) && !personalizedGuest && !existingRSVP)) && (
              <div className={`invitation-dress-code-wrap mx-auto mt-6 grid w-full max-w-5xl gap-4 ${content.dress_code && (content.gift_message || content.gift_type || safeExternalUrl(content.gift_registry_url)) ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {content.dress_code && !personalizedGuest && !existingRSVP && (
                  <article className="invitation-dress-code-card flex h-full items-start gap-4 rounded-[1.5rem] border px-5 py-5 text-left shadow-[0_8px_24px_rgba(48,36,27,0.035)] sm:px-7 sm:py-6" style={{ borderColor: "var(--inv-border)", backgroundColor: "var(--inv-card-bg)", color: "var(--inv-card-text)" }}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border" style={{ background: `linear-gradient(145deg, ${accent}1A, ${accent}08)`, borderColor: `${accent}55`, color: accent }}>
                      <Shirt size={20} strokeWidth={1.65} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>Código de vestimenta</p>
                      <p className="mt-2 text-sm leading-6 sm:text-base" style={{ color: "var(--inv-card-text)" }}>{content.dress_code}</p>
                    </div>
                  </article>
                )}
                {(content.gift_message || content.gift_type || safeExternalUrl(content.gift_registry_url)) && !personalizedGuest && !existingRSVP && (
                  <article className="flex h-full items-start gap-4 rounded-[1.5rem] border px-5 py-5 text-left shadow-[0_8px_24px_rgba(48,36,27,0.035)] sm:px-7 sm:py-6" style={{ borderColor: "var(--inv-border)", backgroundColor: "var(--inv-card-bg)", color: "var(--inv-card-text)" }}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border" style={{ background: `linear-gradient(145deg, ${accent}1A, ${accent}08)`, borderColor: `${accent}55`, color: accent }}>
                      <Gift size={20} strokeWidth={1.65} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>Sugerencias de regalo</p>
                      {content.gift_message && <p className="mt-2 text-sm leading-6 sm:text-base" style={{ color: "var(--inv-card-text)" }}>{content.gift_message}</p>}
                      {content.gift_type && <p className={`${content.gift_message ? "mt-2" : "mt-2"} text-sm font-medium leading-6 sm:text-base`} style={{ color: "var(--inv-card-text)" }}>{content.gift_type}</p>}
                      {safeExternalUrl(content.gift_registry_url) && (
                        <a href={safeExternalUrl(content.gift_registry_url)!} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ backgroundColor: buttonColor, color: buttonTextColor, outlineColor: buttonColor }}>
                          {content.gift_registry_label?.trim() || "Ver mesa de regalos"} <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </article>
                )}
              </div>
            )}

            {invitation.event_date && <Countdown eventDate={invitation.event_date} eventTime={content.ceremony_time} accent={accent} textColor={textColor} />}

          </section>

          {((invitation.rsvp_enabled && Boolean((personalizedGuest && personalizedToken) || (existingRSVP && editToken))) || content.confirmation_mode === "whatsapp") && (content.confirmation_mode !== "whatsapp" && rsvpDeadlinePassed ? (
            <section id="confirmar" className="invitation-rsvp scroll-mt-6 px-5 py-12 sm:px-12 sm:py-16 lg:px-20" style={{ background: `linear-gradient(135deg, ${accent}12, ${background})` }}>
              <div className="invitation-rsvp-closed mx-auto max-w-xl rounded-[1.5rem] border border-black/5 bg-white p-6 text-center shadow-[0_16px_50px_rgba(48,36,27,0.06)] sm:p-8" style={{ backgroundColor: "#FFFDFA", color: "#30283A" }}>
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#805773" }}>Confirmaciones cerradas</p>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl leading-tight sm:text-4xl" style={{ color: "#30283A" }}>El plazo para confirmar terminó</h2>
                <p className="mt-3 text-sm leading-6" style={{ color: "#51483E", opacity: 1 }}>La fecha límite fue el {formatDate(content.rsvp_deadline ?? null) ?? content.rsvp_deadline}. Ya no es posible enviar ni modificar confirmaciones.</p>
              </div>
            </section>
          ) : (
            <section id="confirmar" className="invitation-rsvp scroll-mt-6 px-5 py-12 sm:px-12 sm:py-16 lg:px-20" style={{ background: `linear-gradient(135deg, ${accent}12, ${background})` }}>
              <div className="mx-auto max-w-xl">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{existingRSVP || personalizedGuest?.attendance_status ? "Tu respuesta" : "Nos encantará saber de ti"}</p>
                <h2 className="mt-3 text-center font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">{existingRSVP || personalizedGuest?.attendance_status ? "Tu confirmación" : "¿Nos acompañas?"}</h2>
                <p className="mt-3 text-center text-sm leading-6 text-neutral-600">{existingRSVP || personalizedGuest?.attendance_status ? "Puedes actualizar tus datos aquí." : personalizedGuest ? `Esta invitación está preparada para ti. Tienes ${personalizedGuest.passes} ${personalizedGuest.passes === 1 ? "pase asignado" : "pases asignados"}.` : "Solo te tomará unos segundos confirmar."}</p>
                {content.confirmation_mode !== "whatsapp" && (content.dress_code || content.rsvp_deadline) && (
                  <div className={`mx-auto mt-6 grid w-full gap-3 ${content.dress_code && content.rsvp_deadline ? "sm:grid-cols-2" : "max-w-sm grid-cols-1"}`}>
                    {content.dress_code && (
                      <div className="invitation-rsvp-info-card flex items-start gap-3 rounded-2xl border bg-white/90 p-4 text-left shadow-sm" style={{ borderColor: `${accent}30` }}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}><Shirt size={18} strokeWidth={1.7} /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>Código de vestimenta</p>
                          <p className="mt-1.5 text-sm font-medium leading-5" style={{ color: "#30283A" }}>{content.dress_code}</p>
                        </div>
                      </div>
                    )}
                    {content.rsvp_deadline && (
                      <div className="invitation-rsvp-info-card flex items-start gap-3 rounded-2xl border bg-white/90 p-4 text-left shadow-sm" style={{ borderColor: `${accent}30` }}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}12`, color: accent }}><Clock3 size={18} strokeWidth={1.7} /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>Fecha límite para confirmar</p>
                          <p className="mt-1.5 text-sm font-medium leading-5" style={{ color: "#30283A" }}>{formatDate(content.rsvp_deadline) ?? content.rsvp_deadline}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {content.confirmation_mode !== "whatsapp" && (((existingRSVP && editToken) || (personalizedGuest && personalizedToken && (personalizedGuest.attendance_status || successMessage)))) && (
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
                      <button type="button" onClick={copyPersonalLink} className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition hover:bg-white" style={{ borderColor: `${buttonColor}66`, color: buttonColor }}>
                        {linkCopied ? "Enlace copiado ✓" : "Guardar mi enlace"}
                      </button>
                      <button type="button" onClick={sharePersonalLink} className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: buttonColor, color: buttonTextColor }}>
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
                  <button type="submit" disabled={submitting} className="w-full rounded-full px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: buttonColor, color: buttonTextColor }}>{content.confirmation_mode === "whatsapp" ? "Confirmar por WhatsApp" : submitting ? "Guardando..." : existingRSVP || personalizedGuest?.attendance_status ? "Guardar cambios" : "Confirmar"}</button>
                  {content.confirmation_mode === "whatsapp" ? <p className="text-center text-xs leading-5 text-neutral-400">Se abrirá WhatsApp con tus datos para que envíes la confirmación.</p> : !existingRSVP && <p className="text-center text-xs leading-5 text-neutral-400">Tu respuesta solo será visible para quienes organizan el evento.</p>}
                </form>
              </div>
            </section>
          ))}

          <footer className="px-6 py-10 text-center sm:py-12">
            {content.host_names?.trim() && (
              <>
                <div className="mx-auto mb-5 h-px w-10" style={{ backgroundColor: `${accent}66` }} />
                <p className="font-[var(--font-display)] text-2xl italic" style={{ color: accent }}>{content.host_names.trim()}</p>
              </>
            )}
            <p className={content.host_names?.trim() ? "mt-3 text-[9px] uppercase tracking-[0.3em] text-neutral-400" : "text-[9px] uppercase tracking-[0.3em] text-neutral-400"}>Gracias por ser parte de este día</p>
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

function LocationCard({ title, time, venue, address, maps, calendarUrl, accent }: { title: string; time?: string; venue?: string; address?: string; maps: string | null; calendarUrl: string | null; accent: string }) {
  const isCeremony = title.toLowerCase().includes("ceremonia");
  const isReception = title.toLowerCase().includes("recepción");
  const CardIcon = isCeremony ? Church : isReception ? PartyPopper : Sparkles;
  return (
    <article className="invitation-location-card h-full rounded-[1.5rem] border border-neutral-100 bg-[#FEFDFC] p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-[0_2px_8px_rgba(0,0,0,0.035)]" style={{ background: `linear-gradient(145deg, ${accent}1A, ${accent}08)`, borderColor: `${accent}55`, color: accent }}><span className="absolute inset-[4px] rounded-full border" style={{ borderColor: `${accent}25` }} /><CardIcon size={20} strokeWidth={1.65} className="relative" /></span>
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
      {(maps || calendarUrl) && (
        <div className={`mt-5 grid gap-2.5 sm:mt-6 ${maps && calendarUrl ? "grid-cols-2" : "grid-cols-1"}`}>
          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver ubicación de ${title}`}
              className="invitation-location-button group inline-flex min-h-[52px] min-w-0 items-center justify-start gap-2 rounded-xl border px-2.5 py-2 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(0,0,0,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-3 sm:rounded-2xl sm:px-3.5"
              style={{ borderColor: `${accent}40`, color: accent, background: `linear-gradient(145deg, #FFFFFF, ${accent}08)`, outlineColor: accent }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors group-hover:bg-white" style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}24` }}>
                <ArrowUpRight size={18} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold leading-tight sm:text-xs">Ver ubicación</span>
                <span className="mt-1 block text-[9px] font-medium leading-tight opacity-65 sm:text-[10px]">Cómo llegar</span>
              </span>
            </a>
          ) : <span />}
          {calendarUrl && (
            <a
              href={calendarUrl}
              aria-label={`Agregar ${title} al calendario`}
              className="invitation-location-button group inline-flex min-h-[52px] min-w-0 items-center justify-start gap-2 rounded-xl border px-2.5 py-2 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(0,0,0,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-3 sm:rounded-2xl sm:px-3.5"
              style={{ borderColor: `${accent}40`, color: accent, background: `linear-gradient(145deg, #FFFFFF, ${accent}08)`, outlineColor: accent }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors group-hover:bg-white" style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}24` }}>
                <CalendarPlus size={18} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold leading-tight sm:text-xs">Agregar al</span>
                <span className="mt-1 block text-[9px] font-medium leading-tight opacity-65 sm:text-[10px]">calendario</span>
              </span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

