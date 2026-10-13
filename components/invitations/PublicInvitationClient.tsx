"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Shirt, ArrowUpRight, ChevronDown } from "lucide-react";
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
  const cover = design.cover_image_url?.startsWith("https://") ? design.cover_image_url : null;\n  const templateKey = ["wedding_editorial", "xv_gala", "baby_soft", "baptism_light"].includes(invitation.template_key) ? invitation.template_key : "wedding_editorial";\n  const templateClass = `invitation-template-${templateKey}`;
  const dateLabel = formatDate(invitation.event_date);
  const primaryMapsUrl = mapsUrl(content.ceremony_venue, content.ceremony_address);
  const receptionMapsUrl = mapsUrl(content.reception_venue, content.reception_address);

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
      <div className="mx-auto max-w-6xl sm:px-6 sm:py-8 lg:px-10">
        <article className={`invitation-public ${templateClass} overflow-hidden shadow-[0_28px_100px_rgba(48,36,27,0.12)] sm:rounded-[2rem]`} style={{ backgroundColor: background, color: textColor }}>
          <header className={`invitation-hero relative isolate flex min-h-[56svh] items-end overflow-hidden sm:min-h-[620px] ${cover ? "invitation-hero-has-cover" : "invitation-hero-no-cover"}`}>
            {cover ? (
              <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center invitation-hero-image" style={{ backgroundImage: `url("${cover.replace(/["\\\\]/g, "")}")` }} />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-20 invitation-hero-placeholder" style={{ background: `radial-gradient(ellipse at 75% 18%, ${accent}55, transparent 38%), linear-gradient(145deg, ${background} 0%, ${accent} 100%)` }} />
            )}
            {cover && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/10" />}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-60" />
          </header>
