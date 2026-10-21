import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import PublicInvitationClient from "@/components/invitations/PublicInvitationClient";
import { INVITATION_PALETTES } from "@/lib/invitation-palettes";
import type { InvitationContent, InvitationDesign, InvitationTemplateKey, PublicInvitation } from "@/types/invitation";

export const dynamic = "force-dynamic";

const DEMOS: Record<string, {
  template: InvitationTemplateKey;
  slug: string;
  title: string;
  eventType: string;
  date: string;
  headline: string;
  subtitle: string;
  hostNames: string;
  introduction: string;
  ceremonyTime: string;
  ceremonyVenue: string;
  ceremonyAddress: string;
  receptionTime: string;
  receptionVenue: string;
  receptionAddress: string;
  closing: string;
}> = {
  boda: {
    template: "wedding_editorial",
    slug: "demo-boda",
    title: "Sofía & Alejandro",
    eventType: "wedding",
    date: "2027-05-22",
    headline: "Sofía & Alejandro",
    subtitle: "¡Nos casamos!",
    hostNames: "Junto a nuestras familias",
    introduction: "Hay momentos que se vuelven más especiales cuando se comparten con las personas que queremos. Nos encantará celebrar contigo el inicio de nuestra historia.",
    ceremonyTime: "17:00",
    ceremonyVenue: "Ceremonia",
    ceremonyAddress: "Monterrey, Nuevo León",
    receptionTime: "19:00",
    receptionVenue: "Recepción",
    receptionAddress: "Monterrey, Nuevo León",
    closing: "Nos hará mucha ilusión compartir este día contigo.",
  },
  xv: {
    template: "xv_gala",
    slug: "demo-xv",
    title: "Valentina · Mis XV",
    eventType: "xv",
    date: "2027-07-10",
    headline: "Valentina",
    subtitle: "Mis XV años",
    hostNames: "Con mucho cariño, junto a mi familia",
    introduction: "Una noche de sueños, alegría y momentos inolvidables. Quiero celebrar esta nueva etapa rodeada de las personas que hacen mi vida más especial.",
    ceremonyTime: "",
    ceremonyVenue: "",
    ceremonyAddress: "",
    receptionTime: "19:00",
    receptionVenue: "Salón de celebración",
    receptionAddress: "Monterrey, Nuevo León",
    closing: "¡Te espero para celebrar una noche mágica!",
  },
  baby: {
    template: "baby_soft",
    slug: "demo-revelacion",
    title: "¿Niña o niño?",
    eventType: "gender_reveal",
    date: "2027-04-18",
    headline: "Daniela & Ricardo",
    subtitle: "¿Niña o niño?",
    hostNames: "Daniela & Ricardo",
    introduction: "Hay una dulce sorpresa que queremos compartir contigo. Acompáñanos a descubrir si nuestra familia crecerá con una niña o un niño.",
    ceremonyTime: "",
    ceremonyVenue: "",
    ceremonyAddress: "",
    receptionTime: "16:00",
    receptionVenue: "La celebración",
    receptionAddress: "Monterrey, Nuevo León",
    closing: "Tu compañía hará aún más especial este momento.",
  },
  bautizo: {
    template: "baptism_light",
    slug: "demo-bautizo",
    title: "Bautizo de Mateo",
    eventType: "baptism",
    date: "2027-06-06",
    headline: "Mateo",
    subtitle: "Mi bautizo",
    hostNames: "Con amor, mis papás y padrinos",
    introduction: "Acompáñanos a celebrar un día de fe, amor y bendiciones en familia.",
    ceremonyTime: "12:00",
    ceremonyVenue: "Ceremonia religiosa",
    ceremonyAddress: "Monterrey, Nuevo León",
    receptionTime: "14:00",
    receptionVenue: "Celebración familiar",
    receptionAddress: "Monterrey, Nuevo León",
    closing: "Gracias por ser parte de este día tan especial.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  const demo = DEMOS[tipo];
  return {
    title: demo ? `Demo de invitación · ${demo.title} | Melissarte` : "Demo de invitación | Melissarte",
    robots: { index: false, follow: false },
  };
}

export default async function InvitationDemoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const demo = DEMOS[tipo];
  if (!demo) notFound();

  const content: InvitationContent = {
    event_label: demo.template === "wedding_editorial" ? "Boda" : demo.template === "xv_gala" ? "XV años" : demo.template === "baby_soft" ? "Revelación de género" : "Bautizo",
    headline: demo.headline,
    subtitle: demo.subtitle,
    host_names: demo.hostNames,
    introduction: demo.introduction,
    intro_headline: "Con mucho cariño",
    ceremony_time: demo.ceremonyTime,
    ceremony_venue: demo.ceremonyVenue,
    ceremony_address: demo.ceremonyAddress,
    religious_ceremony_enabled: false,
    reception_time: demo.receptionTime,
    reception_venue: demo.receptionVenue,
    reception_address: demo.receptionAddress,
    dress_code: "Elegante casual",
    gift_message: "",
    gift_type: "",
    gift_registry_url: "",
    gift_registry_label: "",
    confirmation_mode: "none",
    whatsapp_confirmation_phone: "",
    closing_note: demo.closing,
  };

  const invitation: PublicInvitation = {
    invitation_id: `demo-${tipo}`,
    event_id: `demo-event-${tipo}`,
    event_title: demo.title,
    event_date: demo.date,
    event_type: demo.eventType,
    event_slug: demo.slug,
    invitation_slug: demo.slug,
    template_key: demo.template,
    design_config: { ...INVITATION_PALETTES[demo.template] } as InvitationDesign,
    content_config: content,
    rsvp_enabled: false,
    max_party_size: 1,
    invitation_status: "published",
    cover_image: null,
    cover_position_y: null,
  };

  return (
    <>
      <div className="relative z-50 border-b border-[#E6DCCF] bg-[#FCFAF6] px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/invitaciones#demos" className="inline-flex items-center gap-2 text-xs font-semibold text-[#34465D] hover:text-[#A88249] sm:text-sm">
            <ArrowLeft size={16} /> Ver otras demos
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[.15em] text-[#8A795F] sm:text-xs">
            <Eye size={14} /> Ejemplo de diseño
          </span>
        </div>
      </div>
      <PublicInvitationClient
        invitation={invitation}
        existingRSVP={null}
        editToken={null}
        editRequested={false}
      />
    </>
  );
}
