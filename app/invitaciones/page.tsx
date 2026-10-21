import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Invitaciones digitales para tu evento | Melissarte",
  description:
    "Invitaciones digitales personalizadas para bodas, XV años, baby shower, revelaciones y bautizos. Elige tu opción y conoce los diseños demo.",
};

const WHATSAPP_NUMBER = "528133867050";
const WHATSAPP_URL =
  "https://wa.me/" +
  WHATSAPP_NUMBER +
  "?text=" +
  encodeURIComponent("Hola, quiero información sobre las invitaciones digitales.");

const INVITATION_DEMOS = [
  {
    key: "boda",
    label: "Bodas",
    eyebrow: "Una historia de dos",
    title: "Sofía & Alejandro",
    detail: "Elegante · Editorial",
    href: "/invitaciones/demo/boda",
    palette: "from-[#1D2938] via-[#34465D] to-[#F3E9D7]",
    accent: "#D5B77C",
    text: "#FFF8EA",
    initials: "S · A",
    button: "Ver demo de boda",
  },
  {
    key: "xv",
    label: "XV años",
    eyebrow: "Una noche inolvidable",
    title: "Valentina",
    detail: "Gala · Ciruela y oro",
    href: "/invitaciones/demo/xv",
    palette: "from-[#211B35] via-[#4A3654] to-[#D4B5BF]",
    accent: "#E2C47A",
    text: "#FFFAF0",
    initials: "XV",
    button: "Ver demo de XV años",
  },
  {
    key: "baby",
    label: "Baby shower / revelación",
    eyebrow: "Una nueva historia",
    title: "¿Niña o niño?",
    detail: "Suave · Tonos pastel",
    href: "/invitaciones/demo/baby",
    palette: "from-[#FFF4E8] via-[#E9C7B8] to-[#A6CED9]",
    accent: "#A85F47",
    text: "#493C32",
    initials: "♡",
    button: "Ver demo de baby",
  },
  {
    key: "bautizo",
    label: "Bautizos",
    eyebrow: "Un día de bendición",
    title: "Mateo",
    detail: "Luz · Azul y marfil",
    href: "/invitaciones/demo/bautizo",
    palette: "from-[#FAF7F0] via-[#D4E2E8] to-[#7296A8]",
    accent: "#426D86",
    text: "#263641",
    initials: "M",
    button: "Ver demo de bautizo",
  },
] as const;

const INVITATION_FEATURES = [
  "Diseño personalizado con los datos de tu evento",
  "Ubicación con acceso a Google Maps",
  "Botón para agregar la fecha al calendario",
  "Código de vestimenta y sugerencias de regalos",
  "Cuenta regresiva para el gran día",
];

const GALLERY_URL =
  "https://melissartedecorativo.com/products/galeria-digital-para-tu-evento";
const GALLERY_ESSENTIAL_URL =
  "https://melissartedecorativo.com/products/galeria-digital-para-tu-evento?variant=67687177715805";
const GALLERY_MEMORIES_URL =
  "https://melissartedecorativo.com/products/galeria-digital-para-tu-evento?variant=67687177748573";

// Add the exact Shopify variant URLs once confirmed. Avoid sending customers to
// an incorrect product or variant; WhatsApp stays available until configured.
const INVITATION_BASIC_URL = "";
const INVITATION_PLUS_URL = "";

function PriceLink({
  href,
  whatsappText,
  children,
}: {
  href: string;
  whatsappText: string;
  children: ReactNode;
}) {
  const target = href || WHATSAPP_URL;
  const label = href ? children : whatsappText;
  return (
    <a
      href={target}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#263D4B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88249] focus-visible:ring-offset-2"
    >
      {label}
      <ArrowRight size={16} />
    </a>
  );
}

export default function InvitationsLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F2] text-[#27251F]">
      <header className="relative z-10 border-b border-[#E7DFD3] bg-[#F8F6F2]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" aria-label="Melissarte, inicio" className="shrink-0">
            <Image
              src="/me-logo.png"
              alt="Melissarte"
              width={240}
              height={88}
              priority
              className="h-auto w-[118px] sm:w-[145px]"
            />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[#625A50] md:flex">
            <a href="#demos" className="transition hover:text-[#9A7544]">Ver demos</a>
            <a href="#opciones" className="transition hover:text-[#9A7544]">Opciones</a>
            <a href="#galeria" className="transition hover:text-[#9A7544]">Galería digital</a>
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#D6C8B4] px-4 py-2 text-xs font-semibold text-[#34465D] transition hover:bg-white sm:text-sm"
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Resolver dudas</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      <section className="relative isolate px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-8 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#E9DCC9]/45 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#D8E2E4]/60 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.03fr_.97fr] lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B0] bg-[#FCFAF6] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-[#967443] sm:text-xs">
              <Sparkles size={14} />
              Invitaciones digitales personalizadas
            </p>
            <h1 className="mt-7 font-[var(--font-display)] text-[clamp(3.3rem,8vw,6.6rem)] font-semibold leading-[.91] tracking-[-.045em] text-[#20262B]">
              Tu gran día
              <span className="mt-1 block text-[#A88249]">merece una</span>
              <span className="block">gran invitación.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#625A50] sm:text-lg sm:leading-8">
              Comparte todos los detalles de tu celebración en un solo lugar:
              una invitación bonita, práctica y hecha para tu evento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#demos"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172C38]"
              >
                Explorar invitaciones demo
                <ArrowDown size={16} />
              </a>
              <a
                href="#opciones"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D6C8B4] bg-[#FCFAF6] px-6 py-3 text-sm font-semibold text-[#34465D] transition hover:bg-white"
              >
                Comparar opciones
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#746A5D] sm:text-sm">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Enlace para compartir</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Diseño personalizado</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Confirmaciones de asistencia</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div aria-hidden="true" className="absolute -left-4 top-12 h-32 w-32 rounded-full bg-[#E2CDAE]/45 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              <div className="mt-9 rotate-[-3deg] overflow-hidden rounded-[1.4rem] border border-white/80 bg-white p-2.5 shadow-[0_24px_70px_rgba(49,41,30,.12)] sm:mt-12 sm:rounded-[1.8rem] sm:p-3">
                <div className="flex aspect-[3/4.1] flex-col items-center justify-center rounded-[1rem] bg-gradient-to-b from-[#1C2939] via-[#33465A] to-[#817968] px-4 text-center text-[#FFF9EB] sm:rounded-[1.3rem]">
                  <span className="text-[9px] uppercase tracking-[.27em] text-[#E2C47A] sm:text-[10px]">Nos casamos</span>
                  <span className="mt-5 font-[var(--font-display)] text-3xl leading-[.9] sm:text-5xl">Sofía <span className="text-[#D5B77C]">&</span><br />Alejandro</span>
                  <span className="mt-5 h-px w-12 bg-[#D5B77C]" />
                  <span className="mt-4 text-[9px] tracking-[.18em] sm:text-[10px]">22 · MAYO · 2027</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-[1.4rem] border border-white/80 bg-white p-2.5 shadow-[0_24px_70px_rgba(49,41,30,.12)] sm:rounded-[1.8rem] sm:p-3">
                <div className="flex aspect-[3/4.1] flex-col items-center justify-center rounded-[1rem] bg-gradient-to-b from-[#FFF4E8] via-[#E9C7B8] to-[#A7C9D2] px-4 text-center text-[#493C32] sm:rounded-[1.3rem]">
                  <Heart size={20} strokeWidth={1.3} className="text-[#A85F47] sm:h-6 sm:w-6" />
                  <span className="mt-4 text-[9px] uppercase tracking-[.22em] sm:text-[10px]">Una nueva historia</span>
                  <span className="mt-2 font-[var(--font-display)] text-3xl leading-none sm:text-5xl">¿Niña<br />o niño?</span>
                  <span className="mt-3 text-[10px] sm:text-xs">Acompáñanos a descubrirlo</span>
                  <span className="mt-5 rounded-full border border-[#A85F47]/50 px-3 py-1 text-[8px] uppercase tracking-[.15em] sm:text-[9px]">Revelación</span>
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#E6D8C4] bg-[#FCFAF6] px-4 py-2.5 text-[11px] font-medium text-[#625A50] shadow-lg sm:text-xs">
                <CalendarDays size={15} className="text-[#A88249]" />
                Detalles, ubicación y confirmaciones
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demos" className="scroll-mt-8 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">Inspírate</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[#20262B] sm:text-5xl">
              Mira cómo podría verse la tuya
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#625A50] sm:text-base">
              Explora un ejemplo de cada celebración. Cada invitación tiene su propio estilo y puedes ver cómo se presenta en el celular.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {INVITATION_DEMOS.map((demo) => (
              <article key={demo.key} className="group overflow-hidden rounded-[1.4rem] border border-[#E8E0D4] bg-[#FCFAF6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(53,44,32,.10)]">
                <div className={`relative flex aspect-[4/4.5] flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${demo.palette} px-5 text-center`}>
                  <div aria-hidden="true" className="absolute inset-3 rounded-[1rem] border border-current opacity-25" />
                  <span className="relative text-[9px] font-semibold uppercase tracking-[.24em]" style={{ color: demo.accent }}>{demo.eyebrow}</span>
                  <span className="relative mt-4 font-[var(--font-display)] text-4xl font-semibold leading-[.94] tracking-tight sm:text-[2.65rem]" style={{ color: demo.text }}>{demo.title}</span>
                  <span className="relative mt-4 h-px w-9" style={{ backgroundColor: demo.accent }} />
                  <span className="relative mt-3 text-[9px] uppercase tracking-[.17em]" style={{ color: demo.text }}>Una invitación para recordar</span>
                  <span className="absolute bottom-5 right-5 font-[var(--font-display)] text-xl opacity-40" style={{ color: demo.accent }}>{demo.initials}</span>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#A88249]">{demo.label}</p>
                  <p className="mt-1 text-xs text-[#756B5F]">{demo.detail}</p>
                  <Link href={demo.href} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#CDB99D] px-4 py-2.5 text-xs font-semibold text-[#34465D] transition hover:border-[#34465D] hover:bg-white sm:text-sm">
                    {demo.button}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="opciones" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">Elige tu invitación</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[#20262B] sm:text-5xl">
              Dos opciones, el mismo cuidado en cada detalle
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#625A50] sm:text-base">
              Ambas incluyen un diseño personalizado y toda la información importante. La diferencia está en cómo tus invitados confirman su asistencia.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
            <article className="flex flex-col rounded-[1.6rem] border border-[#E1D5C4] bg-[#FFFEFC] p-6 shadow-[0_14px_40px_rgba(49,41,30,.05)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9A7544]">La opción práctica</p>
                <span className="rounded-full bg-[#F2EBE1] px-3 py-1 text-[11px] font-medium text-[#6E5A43]">Básica</span>
              </div>
              <h3 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-[#20262B] sm:text-4xl">Invitación Básica</h3>
              <p className="mt-2 text-sm leading-6 text-[#625A50]">Todo lo esencial para compartir los detalles de tu evento con estilo.</p>
              <p className="mt-6 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-[#20262B]">$199 <span className="font-sans text-sm font-medium text-[#766B5C]">MXN</span></p>
              <div className="my-6 h-px bg-[#E9E0D4]" />
              <p className="text-sm font-semibold text-[#34465D]">Incluye</p>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-[#514A41]">
                {INVITATION_FEATURES.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />{feature}</li>)}
              </ul>
              <div className="mt-5 rounded-2xl bg-[#F8F3EB] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#34465D]"><MessageCircle size={17} /> Confirmación por WhatsApp</p>
                <p className="mt-1 text-xs leading-5 text-[#625A50]">Tus invitados te escriben directamente al número que elijas para confirmar su asistencia.</p>
              </div>
              <div className="mt-auto pt-6">
                <PriceLink href={INVITATION_BASIC_URL} whatsappText="Comprar Básica por WhatsApp">Comprar Básica</PriceLink>
                {!INVITATION_BASIC_URL && <p className="mt-2 text-center text-[11px] text-[#8A6B43]">Enlace directo de Shopify pendiente de confirmar.</p>}
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[#354A56] bg-[#263D4B] p-6 text-white shadow-[0_22px_60px_rgba(38,61,75,.18)] sm:p-8">
              <div aria-hidden="true" className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-[#D5B77C]/25" />
              <div className="relative flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#E3C994]">Más control</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-[#F5E4C2]">Plus</span>
              </div>
              <h3 className="relative mt-3 font-[var(--font-display)] text-3xl font-semibold sm:text-4xl">Invitación Plus</h3>
              <p className="relative mt-2 text-sm leading-6 text-white/75">Ideal para llevar el seguimiento de las respuestas en un solo lugar.</p>
              <p className="relative mt-6 font-[var(--font-display)] text-5xl font-semibold tracking-tight">Precio por confirmar</p>
              <div className="relative my-6 h-px bg-white/15" />
              <p className="relative text-sm font-semibold text-[#E3C994]">Todo lo de Básica, más</p>
              <ul className="relative mt-4 space-y-3 text-sm leading-5 text-white/85">
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Formulario de confirmación en la invitación</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Consulta las respuestas de tus invitados</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Organiza confirmaciones y número de asistentes desde tu panel</li>
              </ul>
              <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#F5E4C2]"><Users size={17} /> Confirmaciones organizadas</p>
                <p className="mt-1 text-xs leading-5 text-white/70">Ya no necesitas reunir los mensajes uno por uno: consulta el estado de las respuestas en el panel.</p>
              </div>
              <div className="relative mt-auto pt-6">
                <PriceLink href={INVITATION_PLUS_URL} whatsappText="Comprar Plus por WhatsApp">Comprar Plus</PriceLink>
                {!INVITATION_PLUS_URL && <p className="mt-2 text-center text-[11px] text-white/70">Enlace directo de Shopify pendiente de confirmar.</p>}
              </div>
            </article>
          </div>

          <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-2 rounded-2xl border border-[#E7DFD3] bg-[#FCFAF6] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-6 text-[#625A50]"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#A88249]" /> En ambas opciones puedes compartir tu invitación por WhatsApp, mensaje o redes sociales.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold text-[#34465D] hover:text-[#A88249]">¿Cuál me conviene? <MessageCircle size={16} /></a>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-9 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">Pensada para tus invitados</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold leading-tight text-[#20262B] sm:text-5xl">Toda la información, sin perderse entre mensajes.</h2>
            <p className="mt-4 text-sm leading-6 text-[#625A50] sm:text-base">
              Tus invitados abren un solo enlace desde su celular y encuentran los detalles de tu celebración de forma clara.
            </p>
            <a href="#opciones" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#34465D]">Comparar las invitaciones <ArrowRight size={16} /></a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: <MapPin size={19} />, title: "Ubicación", body: "Acceso a la ruta de tu evento desde Google Maps." },
              { icon: <CalendarDays size={19} />, title: "Fecha y cuenta regresiva", body: "El día especial, a la vista y en el calendario." },
              { icon: <Gift size={19} />, title: "Regalos y vestimenta", body: "Comparte recomendaciones y código de vestimenta." },
              { icon: <MessageCircle size={19} />, title: "Confirmaciones", body: "Por WhatsApp con Básica o con formulario en Plus." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#E8E0D4] bg-[#FCFAF6] p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E7D8] text-[#967443]">{item.icon}</span>
                <h3 className="mt-4 text-sm font-semibold text-[#2E3940]">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#6A6156]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="galeria" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#202B34] text-white">
          <div className="grid lg:grid-cols-[1fr_1fr]">
            <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[#E3C994]"><Camera size={15} /> Complementa tu invitación</p>
              <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">Guarda también los recuerdos del gran día.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                La invitación comparte los detalles antes del evento. La galería digital reúne las fotos, mensajes y voces que tus invitados comparten durante la celebración.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><QrCode size={15} /> QR y enlace</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><Camera size={15} /> Fotos ilimitadas</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><Play size={15} /> Presentación en vivo</span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={GALLERY_URL} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D5B77C] px-5 py-3 text-sm font-semibold text-[#202B34] transition hover:bg-[#E4CC9C]">Conocer la galería <ArrowRight size={16} /></Link>
                <Link href="https://events.melissartedecorativo.com/e/boda-sofia-y-alejandro" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ver demo de galería <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="border-t border-white/10 p-5 sm:p-8 lg:border-l lg:border-t-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/15 bg-white/[.04] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#E3C994]">Galería Esencial</p>
                  <p className="mt-3 font-[var(--font-display)] text-4xl font-semibold">$349 <span className="font-sans text-xs font-medium text-white/60">MXN</span></p>
                  <ul className="mt-4 space-y-2 text-xs leading-5 text-white/75">
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Fotos ilimitadas</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />QR y enlace personalizado</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Presentación en vivo y descarga</li>
                  </ul>
                  <Link href={GALLERY_ESSENTIAL_URL} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">Comprar Esencial <ArrowRight size={14} /></Link>
                </article>
                <article className="rounded-2xl border border-[#D5B77C]/45 bg-[#D5B77C]/[.08] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#E3C994]">Galería Recuerdos</p>
                  <p className="mt-3 font-[var(--font-display)] text-4xl font-semibold">$449 <span className="font-sans text-xs font-medium text-white/60">MXN</span></p>
                  <ul className="mt-4 space-y-2 text-xs leading-5 text-white/75">
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Todo lo de Esencial</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Mensajes escritos y de voz</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Libro digital y audios descargables</li>
                  </ul>
                  <Link href={GALLERY_MEMORIES_URL} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#D5B77C] px-3 py-2 text-xs font-semibold text-[#202B34] transition hover:bg-[#E4CC9C]">Comprar Recuerdos <ArrowRight size={14} /></Link>
                </article>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/55"><Clock3 size={14} className="mt-0.5 shrink-0" /> La galería se habilita un día antes del evento y permanece disponible hasta 30 días después.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl rounded-[1.6rem] border border-[#E8E0D4] bg-[#FCFAF6] px-6 py-9 text-center sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">¿Listo para empezar?</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold text-[#20262B] sm:text-5xl">Hagamos una invitación muy tuya.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#625A50] sm:text-base">
            Elige la opción que se adapte a tu celebración y, si tienes dudas, te ayudamos a decidir.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172C38]"><MessageCircle size={17} /> Hablar por WhatsApp</a>
            <a href="#opciones" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D6C8B4] px-6 py-3 text-sm font-semibold text-[#34465D] transition hover:bg-white">Ver opciones <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8E0D4] px-5 py-6 text-center text-xs text-[#766B5C] sm:px-8">
        <p>Melissarte · Invitaciones digitales para los momentos que importan.</p>
        <p className="mt-1">Diseñadas para compartir, fáciles de consultar y hechas para tu celebración.</p>
      </footer>
    </main>
  );
}
