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
    "Invitaciones digitales personalizadas para bodas y XV años. Explora los diseños disponibles y elige la opción ideal para tu evento.",
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
    label: "Boda",
    detail: "Elegante · Editorial",
    title: "Sofía y Alejandro",
    href: "https://events.melissartedecorativo.com/i/boda-sofia-y-alejandro",
    image: "/invitaciones/demo-boda.webp",
    button: "Ver invitación completa",
  },
  {
    key: "xv",
    label: "XV años",
    detail: "Gala · Ciruela y oro",
    title: "Valentina",
    href: "https://events.melissartedecorativo.com/i/xv",
    image: "/invitaciones/demo-xv.webp",
    button: "Ver invitación completa",
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

const INVITATION_ESSENTIAL_URL =
  "https://melissartedecorativo.com/products/invitacion-digital-para-tu-evento?variant=67790310834269";
const INVITATION_PLUS_URL =
  "https://melissartedecorativo.com/products/invitacion-digital-para-tu-evento?variant=67790310867037";

function PriceLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#263D4B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A88249] focus-visible:ring-offset-2"
    >
      {children}
      <ArrowRight size={16} />
    </a>
  );
}

export default function InvitationsLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F2] text-[#27251F]">
      <header className="relative z-10 border-b border-[#E7DFD3] bg-[#F8F6F2]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="shrink-0 leading-tight">
            <span className="block font-[var(--font-display)] text-lg font-semibold tracking-tight text-[#263D4B] sm:text-xl">Invitaciones</span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.22em] text-[#9A7544]">Digitales</span>
          </div>
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
            <div className="relative grid grid-cols-2 items-start gap-3 sm:gap-4">
              <a href="https://events.melissartedecorativo.com/i/boda-sofia-y-alejandro" target="_blank" rel="noreferrer" aria-label="Ver invitación real de boda" className="mt-9 block rotate-[-3deg] overflow-hidden rounded-[1.4rem] border border-white/80 bg-white p-2.5 shadow-[0_24px_70px_rgba(49,41,30,.12)] transition hover:-translate-y-1 sm:mt-12 sm:rounded-[1.8rem] sm:p-3">
                <Image src="/invitaciones/demo-boda.webp" alt="Vista previa de la invitación de boda de Sofía y Alejandro" width={220} height={273} priority sizes="(min-width: 1024px) 260px, 44vw" className="h-auto w-full rounded-[1rem] sm:rounded-[1.3rem]" />
              </a>
              <a href="https://events.melissartedecorativo.com/i/xv" target="_blank" rel="noreferrer" aria-label="Ver invitación real de XV años" className="block overflow-hidden rounded-[1.4rem] border border-white/80 bg-white p-2.5 shadow-[0_24px_70px_rgba(49,41,30,.12)] transition hover:-translate-y-1 sm:rounded-[1.8rem] sm:p-3">
                <Image src="/invitaciones/demo-xv.webp" alt="Vista previa de la invitación de XV años de Valentina" width={220} height={275} priority sizes="(min-width: 1024px) 260px, 44vw" className="h-auto w-full rounded-[1rem] sm:rounded-[1.3rem]" />
              </a>
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#E6D8C4] bg-[#FCFAF6] px-4 py-2.5 text-[11px] font-medium text-[#625A50] shadow-lg sm:text-xs">
                <CalendarDays size={15} className="text-[#A88249]" />
                Explora las invitaciones completas
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
              Por ahora puedes explorar nuestras invitaciones de boda y XV años. Ábrelas desde tu celular para conocer la experiencia completa.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-7 sm:grid-cols-2">
            {INVITATION_DEMOS.map((demo) => (
              <article key={demo.key} className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[1.5rem] border border-[#E8E0D4] bg-[#FCFAF6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(53,44,32,.10)]">
                <a href={demo.href} target="_blank" rel="noreferrer" aria-label={demo.button} className="block bg-[#F0E8DB] p-3 sm:p-4">
                  <div className="mx-auto max-w-[310px] overflow-hidden rounded-[1.1rem] border border-white/80 bg-white shadow-[0_14px_40px_rgba(49,41,30,.16)] sm:rounded-[1.4rem]">
                    <Image
                      src={demo.image}
                      alt={`Captura de la invitación digital de ${demo.title}`}
                      width={430}
                      height={913}
                      sizes="(min-width: 640px) 310px, 90vw"
                      className="h-auto w-full"
                    />
                  </div>
                </a>
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#A88249]">{demo.label}</p>
                  <h3 className="mt-1 font-[var(--font-display)] text-2xl font-semibold text-[#20262B] sm:text-3xl">{demo.title}</h3>
                  <p className="mt-1 text-sm text-[#756B5F]">{demo.detail}</p>
                  <a href={demo.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#CDB99D] px-4 py-2.5 text-xs font-semibold text-[#34465D] transition hover:border-[#34465D] hover:bg-white sm:text-sm">
                    {demo.button}
                    <ArrowRight size={15} />
                  </a>
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
                <span className="rounded-full bg-[#F2EBE1] px-3 py-1 text-[11px] font-medium text-[#6E5A43]">Esencial</span>
              </div>
              <h3 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-[#20262B] sm:text-4xl">Invitación Esencial</h3>
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
                <PriceLink href={INVITATION_ESSENTIAL_URL}>Comprar Esencial</PriceLink>
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
              <p className="relative mt-6 font-[var(--font-display)] text-5xl font-semibold tracking-tight">$349 <span className="font-sans text-sm font-medium text-white/60">MXN</span></p>
              <div className="relative my-6 h-px bg-white/15" />
              <p className="relative text-sm font-semibold text-[#E3C994]">Todo lo de Esencial, más</p>
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
                <PriceLink href={INVITATION_PLUS_URL}>Comprar Plus</PriceLink>
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
              { icon: <MessageCircle size={19} />, title: "Confirmaciones", body: "Por WhatsApp con Esencial o con formulario en Plus." },
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
        <p>Invitaciones digitales para los momentos que importan.</p>
        <p className="mt-1">Diseñadas para compartir, fáciles de consultar y hechas para tu celebración.</p>
      </footer>
    </main>
  );
}
