import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
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
    href: "https://events.melissartedecorativo.com/i/boda-sofia-y-alejandro",
    button: "Ver invitación completa",
  },
  {
    key: "xv",
    label: "XV años",
    href: "https://events.melissartedecorativo.com/i/xv",
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
  tone = "navy",
  children,
}: {
  href: string;
  tone?: "navy" | "gold";
  children: ReactNode;
}) {
  const colors =
    tone === "gold"
      ? "bg-[#D5B77C] text-[#202B34] hover:bg-[#E8D09E] focus-visible:ring-white"
      : "bg-[#263D4B] text-white hover:bg-[#172C38] focus-visible:ring-[#A88249]";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${colors}`}
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

      <section className="relative isolate px-5 pb-10 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-8 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#E9DCC9]/45 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#D8E2E4]/60 blur-3xl" />
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B0] bg-[#FCFAF6] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-[#967443] sm:text-xs">
              <Sparkles size={14} />
              Invitaciones digitales personalizadas
            </p>
            <h1 className="mt-5 font-[var(--font-display)] text-[clamp(3rem,8vw,6.2rem)] font-semibold leading-[.94] tracking-[-.045em] text-[#20262B]">
              Tu gran día
              <span className="mt-1 block text-[#A88249]">merece una</span>
              <span className="block">gran invitación.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#625A50] sm:text-lg sm:leading-8">
              Comparte los detalles de tu evento y recibe confirmaciones desde un solo enlace.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <a
                href="#demos"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172C38]"
              >
                Ver invitaciones demo
                <ArrowDown size={16} />
              </a>
              <a
                href="#opciones"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D6C8B4] bg-[#FCFAF6] px-6 py-3 text-sm font-semibold text-[#34465D] transition hover:bg-white"
              >
                Ver precios
              </a>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#746A5D] sm:text-sm">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Enlace para compartir</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Diseño personalizado</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#A88249]" /> Confirmaciones de asistencia</span>
            </div>
          </div>
        </div>
      </section>

      <section id="demos" className="scroll-mt-8 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">Inspírate</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[#20262B] sm:text-5xl">
              Mira cómo podría verse la tuya
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#625A50] sm:text-base">
              Explora las demos de boda y XV años desde tu celular.
            </p>
          </div>
          <div className="mx-auto mt-7 grid max-w-5xl gap-5 sm:grid-cols-2">
            {INVITATION_DEMOS.map((demo) => (
              <article key={demo.key} className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[1.5rem] border border-[#E8E0D4] bg-[#FCFAF6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(53,44,32,.10)]">
                <a href={demo.href} target="_blank" rel="noreferrer" aria-label={demo.button} className="block bg-[#F0E8DB] p-3 sm:p-4">
                  <div className="relative mx-auto aspect-[9/20] w-full max-w-[310px] overflow-hidden rounded-[1.1rem] border border-white/80 bg-white shadow-[0_14px_40px_rgba(49,41,30,.16)] sm:rounded-[1.4rem]">
                    <iframe
                      title={`Vista previa de invitación demo de ${demo.label}`}
                      src={demo.href}
                      loading="lazy"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
                    />
                  </div>
                </a>
                <div className="p-5 sm:p-6">
                  <p className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[#263D4B] sm:text-3xl">{demo.label}</p>
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

      <section id="opciones" className="scroll-mt-8 px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">Elige tu invitación</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[#20262B] sm:text-5xl">
              Dos opciones, el mismo cuidado en cada detalle
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#625A50] sm:text-base">
              Las dos incluyen diseño personalizado y confirmación de asistencia. Plus te ayuda a organizar a tus invitados.
            </p>
          </div>

          <div className="mx-auto mt-7 grid max-w-5xl gap-4 lg:grid-cols-2">
            <article className="flex flex-col rounded-[1.6rem] border border-[#E1D5C4] bg-[#FFFEFC] p-6 shadow-[0_14px_40px_rgba(49,41,30,.05)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9A7544]">Tu invitación personalizada</p>
                <span className="rounded-full bg-[#F2EBE1] px-3 py-1 text-[11px] font-medium text-[#6E5A43]">Esencial</span>
              </div>
              <h3 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-[#20262B] sm:text-4xl">Invitación Esencial</h3>
              <p className="mt-2 text-sm leading-6 text-[#625A50]">Comparte los detalles de tu evento y recibe confirmaciones.</p>
              <p className="mt-5 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-[#20262B]">$199 <span className="font-sans text-sm font-medium text-[#766B5C]">MXN · pago único</span></p>
              <div className="my-6 h-px bg-[#E9E0D4]" />
              <p className="text-sm font-semibold text-[#34465D]">Incluye</p>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-[#514A41]">
                {INVITATION_FEATURES.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />{feature}</li>)}
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />Formulario de confirmación de asistencia en la invitación</li>
              </ul>
              <div className="mt-5 rounded-2xl bg-[#F8F3EB] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#34465D]"><MessageCircle size={17} /> Confirmación por WhatsApp</p>
                <p className="mt-1 text-xs leading-5 text-[#625A50]">Tus invitados te escriben directamente al número que elijas para confirmar su asistencia.</p>
              </div>
              <div className="mt-auto pt-6">
                <PriceLink href={INVITATION_ESSENTIAL_URL}>Elegir Esencial</PriceLink>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#D5B77C] bg-[#263D4B] p-6 text-white shadow-[0_22px_55px_rgba(38,61,75,.22)] sm:p-8">
              <div aria-hidden="true" className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-[#D5B77C]/25" />
              <div className="relative flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#E3C994]">Organiza todo fácilmente</p>
                <span className="rounded-full bg-[#D5B77C] px-3 py-1.5 text-xs font-bold text-[#202B34]">PLUS · MÁS ELEGIDA</span>
              </div>
              <h3 className="relative mt-3 font-[var(--font-display)] text-3xl font-semibold sm:text-4xl">Invitación Plus</h3>
              <p className="relative mt-2 text-sm leading-6 text-white/75">Administra invitados, envíos y respuestas desde un solo lugar.</p>
              <p className="relative mt-5 font-[var(--font-display)] text-5xl font-semibold tracking-tight">$349 <span className="font-sans text-sm font-medium text-white/60">MXN · pago único</span></p>
              <div className="relative my-6 h-px bg-white/15" />
              <p className="relative text-sm font-semibold text-[#E3C994]">Todo lo de Esencial, más</p>
              <ul className="relative mt-4 space-y-3 text-sm leading-5 text-white/85">
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Importa tu lista desde Excel</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Envía por WhatsApp con enlaces personalizados</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Asignación de pases por invitado o familia</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Administra invitados y respuestas en tu panel privado</li>
                <li className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-[#E3C994]" />Da seguimiento a envíos y confirmaciones</li>
              </ul>
              <div className="relative mt-auto pt-6">
                <PriceLink href={INVITATION_PLUS_URL} tone="gold">Elegir Plus</PriceLink>
              </div>
            </article>
          </div>

          <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-2 rounded-2xl border border-[#E7DFD3] bg-[#FCFAF6] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-6 text-[#625A50]"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#A88249]" /> En ambas opciones puedes compartir tu invitación por WhatsApp, mensaje o redes sociales.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold text-[#34465D] hover:text-[#A88249]">¿Cuál me conviene? <MessageCircle size={16} /></a>
          </div>
        </div>
      </section>

      <section id="galeria" className="scroll-mt-8 px-5 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-[#D8D0C4] bg-[#303A40] text-white">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-9 lg:py-9">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#D8C49F]"><Camera size={13} /> Un extra para tu evento</p>
              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">Conserva los recuerdos de tu evento</h2>
              <p className="mt-3 max-w-xl text-xs leading-5 text-white/70 sm:text-sm">
                La invitación comparte los detalles antes del evento. La galería digital reúne las fotos, mensajes y voces que tus invitados comparten durante la celebración.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/75">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><QrCode size={15} /> QR y enlace</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><Camera size={15} /> Fotos ilimitadas</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2"><Play size={15} /> Presentación en vivo</span>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link href={GALLERY_URL} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#D5B77C] px-4 py-2.5 text-xs font-semibold text-[#202B34] transition hover:bg-[#E4CC9C]">Conocer la galería <ArrowRight size={16} /></Link>
                <Link href="https://events.melissartedecorativo.com/e/boda-sofia-y-alejandro" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white/90 transition hover:bg-white/10">Ver demo de galería <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="border-t border-white/10 p-4 sm:p-6 lg:border-l lg:border-t-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-white/10 bg-white/[.035] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#E3C994]">Galería Esencial</p>
                  <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold">$349 <span className="font-sans text-xs font-medium text-white/60">MXN</span></p>
                  <ul className="mt-4 space-y-2 text-xs leading-5 text-white/75">
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Fotos ilimitadas</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />QR y enlace personalizado</li>
                    <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#E3C994]" />Presentación en vivo y descarga</li>
                  </ul>
                  <Link href={GALLERY_ESSENTIAL_URL} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">Comprar Esencial <ArrowRight size={14} /></Link>
                </article>
                <article className="rounded-2xl border border-[#D5B77C]/45 bg-[#D5B77C]/[.08] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#E3C994]">Galería Recuerdos</p>
                  <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold">$449 <span className="font-sans text-xs font-medium text-white/60">MXN</span></p>
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

      <section className="px-5 pb-10 sm:px-8 sm:pb-16">
        <div className="mx-auto max-w-6xl rounded-[1.6rem] border border-[#E8E0D4] bg-[#FCFAF6] px-5 py-7 text-center sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#A88249]">¿Listo para empezar?</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-[#20262B] sm:text-5xl">Hagamos una invitación muy tuya.</h2>
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
        
      </footer>
    </main>
  );
}
