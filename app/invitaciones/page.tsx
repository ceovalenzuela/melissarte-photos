import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Invitaciones digitales para tu evento | Melissarte",
  description:
    "Invitaciones digitales personalizadas para compartir los detalles de tu evento de una forma especial.",
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
  },
  {
    key: "xv",
    label: "XV años",
    href: "https://events.melissartedecorativo.com/i/xv",
  },
] as const;

const GALLERY_URL =
  "https://melissartedecorativo.com/products/galeria-digital-para-tu-evento";


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
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${colors}`}
    >
      {children}
      <ArrowRight size={16} />
    </a>
  );
}

export default function InvitationsLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F2] text-[#27251F]">
      <header className="border-b border-[#E7DFD3] bg-[#F8F6F2]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8 sm:py-3">
          <a href="#inicio" className="shrink-0" aria-label="Melissarte Events, inicio">
            <Image
              src="/me-logo.png"
              alt="Melissarte Events"
              width={2024}
              height={777}
              priority
              className="h-auto w-[112px] sm:w-[150px]"
            />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-[#625A50] md:flex">
            <a href="/crear-invitacion" className="transition hover:text-[#9A7544]">Crear invitación</a>
            <a href="#demos" className="transition hover:text-[#9A7544]">Ejemplos</a>
            <a href="#opciones" className="transition hover:text-[#9A7544]">Paquetes</a>
            <a href="#galeria" className="transition hover:text-[#9A7544]">Galería digital</a>
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#D6C8B4] px-3.5 py-2 text-xs font-semibold text-[#34465D] transition hover:bg-white sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <MessageCircle size={15} />
            <span className="hidden sm:inline">¿Tienes dudas?</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      <section id="inicio" className="relative isolate px-5 py-8 sm:px-8 sm:py-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-0 -z-10 h-72 w-72 rounded-full bg-[#E9DCC9]/40 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B0] bg-[#FCFAF6] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#967443] sm:text-xs">
            <Sparkles size={13} />
            Invitaciones digitales personalizadas
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-[clamp(2.55rem,7vw,4.7rem)] font-semibold leading-[.96] tracking-[-.045em] text-[#20262B]">
            Tu gran día merece
            <span className="block text-[#A88249]">una gran invitación.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#625A50] sm:text-base">
            Encuentra un diseño que vaya contigo, personaliza los detalles de tu evento y comparte tu invitación desde un solo enlace.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <a
              href="/crear-invitacion"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172C38]"
            >
              Crear mi invitación <ArrowRight size={16} />
            </a>
            <a
              href="#demos"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D6C8B4] bg-[#FCFAF6] px-6 py-2.5 text-sm font-semibold text-[#34465D] transition hover:bg-white"
            >
              Ver ejemplos <ArrowDown size={15} />
            </a>
          </div>
          <p className="mt-4 text-xs text-[#746A5D]">
            Diseño personalizado <span className="mx-1.5 text-[#CDB99D]">·</span>
            Enlace para compartir <span className="mx-1.5 text-[#CDB99D]">·</span>
            Confirmaciones de asistencia
          </p>
        </div>
      </section>

      <section id="demos" className="scroll-mt-5 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Inspírate</p>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold text-[#20262B] sm:text-3xl">Conoce nuestros ejemplos</h2>
            </div>
            <p className="text-xs text-[#746A5D]">Entra a cada invitación para conocerla.</p>
          </div>
          <div className="mx-auto mt-4 grid max-w-2xl grid-cols-2 gap-3 sm:gap-5">
            {INVITATION_DEMOS.map((demo) => (
              <article key={demo.key} className="overflow-hidden rounded-2xl border border-[#E8E0D4] bg-[#FCFAF6] shadow-[0_8px_24px_rgba(55,45,32,.045)]">
                <a href={demo.href} target="_blank" rel="noopener noreferrer" aria-label={`Explorar inspiración de ${demo.label}`} className="group block p-2.5 sm:p-3">
                  <div className={`relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-xl border px-3 text-center ${demo.key === "boda" ? "border-[#E5DFD2] bg-[#F4F1E9]" : "border-[#EADDE0] bg-[#F5ECEE]"}`}>
                    <span className={`text-[9px] font-semibold uppercase tracking-[.24em] ${demo.key === "boda" ? "text-[#879783]" : "text-[#AD7D89]"}`}>Inspiración</span>
                    <span className={`mt-2 font-[var(--font-display)] text-[clamp(1.65rem,5vw,2.35rem)] font-semibold leading-none tracking-[-.04em] ${demo.key === "boda" ? "text-[#263D4B]" : "text-[#684957]"}`}>{demo.label}</span>
                    <span aria-hidden="true" className="my-3 flex items-center gap-2">
                      <span className={`h-px w-7 ${demo.key === "boda" ? "bg-[#C5A66A]" : "bg-[#C99AA5]"}`} />
                      <span className={`text-sm ${demo.key === "boda" ? "text-[#B3925F]" : "text-[#B88B66]"}`}>✦</span>
                      <span className={`h-px w-7 ${demo.key === "boda" ? "bg-[#C5A66A]" : "bg-[#C99AA5]"}`} />
                    </span>
                    <span className={`max-w-[13rem] font-[var(--font-display)] text-xs italic leading-relaxed sm:text-sm ${demo.key === "boda" ? "text-[#777467]" : "text-[#856A75]"}`}>
                      {demo.key === "boda" ? "Un día para recordar, una historia para celebrar" : "Una noche para brillar y crear recuerdos"}
                    </span>
                    <span className="mt-4 flex items-center gap-2" aria-label={demo.key === "boda" ? "Paleta marfil, salvia y dorado" : "Paleta rosa, champagne y malva"}>
                      {demo.key === "boda" ? (
                        <>
                          <span className="h-3 w-3 rounded-full bg-[#F6F1E7] ring-1 ring-[#D9D0C1]" />
                          <span className="h-3 w-3 rounded-full bg-[#9EAF9A]" />
                          <span className="h-3 w-3 rounded-full bg-[#C5A66A]" />
                        </>
                      ) : (
                        <>
                          <span className="h-3 w-3 rounded-full bg-[#F2DDE1] ring-1 ring-[#D9BFC4]" />
                          <span className="h-3 w-3 rounded-full bg-[#D49AA9]" />
                          <span className="h-3 w-3 rounded-full bg-[#C5A66A]" />
                        </>
                      )}
                    </span>
                  </div>
                </a>                <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                  <div className="min-w-0">
                    <h3 className="font-[var(--font-display)] text-base font-semibold text-[#263D4B] sm:text-lg">{demo.label}</h3>
                    <p className="mt-0.5 text-[10px] text-[#82786B] sm:text-xs">{demo.key === "boda" ? "Editorial · Marfil y salvia" : "Romántico · Rosa y champagne"}</p>
                  </div>
                  <a href={demo.href} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ejemplo de ${demo.label}`} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CDB99D] text-[#34465D] transition group-hover:bg-[#F8F4EC] hover:bg-white">
                    <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="crear" className="scroll-mt-5 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto grid max-w-5xl items-center gap-5 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Tu invitación comienza aquí</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[#20262B] sm:text-4xl">Elige tu diseño y hazla tuya</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#625A50]">Elige el estilo que más te guste y agrega los detalles de tu celebración. Después podrás seleccionar el paquete que mejor se adapte a lo que necesitas.</p>
            <a href="/crear-invitacion" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172C38]">Ver diseños <ArrowRight size={16} /></a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#E5D9C8] bg-[#F8F4EC] p-4">
              <span className="text-xs font-semibold uppercase tracking-[.15em] text-[#A88249]">01</span>
              <p className="mt-2 font-[var(--font-display)] text-lg font-semibold text-[#263D4B]">Elige tu estilo</p>
              <p className="mt-1 text-xs leading-5 text-[#70675B]">Encuentra el diseño que va con tu celebración.</p>
            </div>
            <div className="rounded-2xl border border-[#E5D9C8] bg-[#F8F4EC] p-4">
              <span className="text-xs font-semibold uppercase tracking-[.15em] text-[#A88249]">02</span>
              <p className="mt-2 font-[var(--font-display)] text-lg font-semibold text-[#263D4B]">Personaliza</p>
              <p className="mt-1 text-xs leading-5 text-[#70675B]">Agrega nombres, fecha y detalles del evento.</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-[#E5D9C8] bg-[#263D4B] p-4 text-white">
              <span className="text-xs font-semibold uppercase tracking-[.15em] text-[#E3C994]">03</span>
              <p className="mt-2 font-[var(--font-display)] text-lg font-semibold">Selecciona tu paquete</p>
              <p className="mt-1 text-xs leading-5 text-white/75">Elige Esencial o Plus según las herramientas que quieras para organizar a tus invitados.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="opciones" className="scroll-mt-5 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-8 sm:px-8 sm:py-11">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Elige tu paquete</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[#20262B] sm:text-4xl">
              Completa tu invitación
            </h2>
          </div>

          <div className="mx-auto mt-6 grid gap-4 lg:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-[#E1D5C4] bg-[#FCFAF6] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold text-[#20262B]">Esencial</h3>
                <span className="rounded-full bg-[#F2EBE1] px-3 py-1 text-[10px] font-medium text-[#6E5A43]">Diseño personalizado</span>
              </div>
              <p className="mt-2 text-sm text-[#625A50]">Todo lo necesario para compartir la información de tu evento.</p>
              <p className="mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[#20262B]">
                $199 <span className="font-sans text-xs font-medium text-[#766B5C]">MXN · pago único</span>
              </p>
              <ul className="my-5 space-y-2.5 text-sm leading-5 text-[#514A41]">
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#A88249]" />Ubicación, calendario y cuenta regresiva</li>
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#A88249]" />Vestimenta y sugerencias de regalos</li>
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#A88249]" />Confirmaciones de asistencia por WhatsApp</li>
              </ul>
              <div className="mt-auto pt-1">
                <PriceLink href="/crear-invitacion">Diseñar mi invitación</PriceLink>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#D5B77C] bg-[#263D4B] p-5 text-white shadow-[0_12px_30px_rgba(38,61,75,.12)] sm:p-6">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />
              <div className="relative flex items-center justify-between gap-3">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold">Plus</h3>
                <span className="rounded-full bg-[#D5B77C] px-3 py-1 text-[10px] font-bold text-[#202B34]">Gestión de invitados</span>
              </div>
              <p className="relative mt-2 text-sm leading-5 text-white/75">Ideal para llevar las invitaciones y respuestas organizadas.</p>
              <p className="relative mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight">
                $349 <span className="font-sans text-xs font-medium text-white/60">MXN · pago único</span>
              </p>
              <p className="relative mt-4 text-xs font-semibold uppercase tracking-[.12em] text-[#E3C994]">Todo lo de Esencial, más</p>
              <ul className="relative my-4 space-y-2.5 text-sm leading-5 text-white/85">
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#E3C994]" />Importa la lista de invitados desde Excel</li>
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#E3C994]" />Enlaces personalizados para enviar por WhatsApp</li>
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#E3C994]" />Pases por persona o familia</li>
                <li className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#E3C994]" />Panel para consultar invitados y confirmaciones</li>
              </ul>
              <div className="relative mt-auto pt-1">
                <PriceLink href="/crear-invitacion" tone="gold">Diseñar mi invitación</PriceLink>
              </div>
            </article>
          </div>
          <p className="mt-4 text-center text-xs text-[#746A5D]">
            ¿Tienes dudas? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#34465D] underline decoration-[#CDB99D] underline-offset-4">Escríbenos por WhatsApp</a>
          </p>
        </div>
      </section>

      <section id="galeria" className="scroll-mt-5 px-5 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-[#E6DED1] bg-[#F2EEE7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-6">
          <p className="text-xs leading-5 text-[#70675B] sm:text-sm">
            <Camera size={14} className="mr-1.5 inline-block align-[-2px] text-[#9A7544]" />
            <span className="font-semibold text-[#35414A]">¿Quieres guardar los recuerdos?</span> Complementa tu evento con una galería de fotos, mensajes y audios.
          </p>
          <a href={GALLERY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#34465D] underline decoration-[#CDB99D] underline-offset-4">
            Galería digital desde $349 <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <footer className="border-t border-[#E8E0D4] px-5 py-4 text-center text-[11px] text-[#766B5C] sm:px-8">
        Melissarte Events · Invitaciones digitales para los momentos que importan.
      </footer>
    </main>
  );
}
