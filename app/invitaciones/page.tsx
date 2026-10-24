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
    "Invitaciones digitales personalizadas para bodas y XV años. Elige tu diseño y compra en línea.",
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
            <a href="#opciones" className="transition hover:text-[#9A7544]">Precios</a>
            <a href="#demos" className="transition hover:text-[#9A7544]">Ver demos</a>
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
            Comparte los detalles de tu evento y facilita las confirmaciones desde un solo enlace.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <a
              href="#opciones"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#263D4B] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172C38]"
            >
              Ver precios y comprar <ArrowRight size={16} />
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

      <section id="opciones" className="scroll-mt-5 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-8 sm:px-8 sm:py-11">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Elige tu opción</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[#20262B] sm:text-4xl">
              Una invitación a tu medida
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#625A50]">
              Ambas son personalizadas. Plus añade herramientas para organizar a tus invitados.
            </p>
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
                <PriceLink href={INVITATION_ESSENTIAL_URL}>Comprar Esencial</PriceLink>
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
                <PriceLink href={INVITATION_PLUS_URL} tone="gold">Comprar Plus</PriceLink>
              </div>
            </article>
          </div>
          <p className="mt-4 text-center text-xs text-[#746A5D]">
            ¿Tienes dudas? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#34465D] underline decoration-[#CDB99D] underline-offset-4">Escríbenos por WhatsApp</a>
          </p>
        </div>
      </section>

      <section id="demos" className="scroll-mt-5 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Mira los diseños</p>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold text-[#20262B] sm:text-3xl">Conoce una invitación real</h2>
            </div>
            <p className="text-xs text-[#746A5D]">Abre cada demo para verla completa.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5">
            {INVITATION_DEMOS.map((demo) => (
              <article key={demo.key} className="overflow-hidden rounded-xl border border-[#E8E0D4] bg-[#FCFAF6]">
                <a href={demo.href} target="_blank" rel="noopener noreferrer" aria-label={`Ver invitación de ${demo.label}`} className="block bg-[#F0E8DB] p-2.5 sm:p-3">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-lg border border-white/80 bg-white">
                    <iframe
                      title={`Vista previa de invitación demo de ${demo.label}`}
                      src={demo.href}
                      loading="lazy"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
                    />
                  </div>
                </a>
                <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
                  <h3 className="font-[var(--font-display)] text-base font-semibold text-[#263D4B] sm:text-lg">{demo.label}</h3>
                  <a href={demo.href} target="_blank" rel="noopener noreferrer" aria-label={`Abrir demo de ${demo.label}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#CDB99D] text-[#34465D] transition hover:bg-white">
                    <ArrowRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="organizador" className="scroll-mt-5 border-y border-[#E8E0D4] bg-[#FFFEFC] px-5 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A88249]">Exclusivo de Invitación Plus</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[#20262B] sm:text-4xl">Tu evento, bajo control</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#625A50]">Organiza tu lista, asigna pases y revisa las respuestas desde un solo lugar, sin perder de vista ningún detalle.</p>
          </div>
          <div className="mt-6 grid items-start gap-4 md:grid-cols-[1.05fr_.95fr] md:gap-5">
            <article className="overflow-hidden rounded-[1.35rem] border border-[#E6DED1] bg-[#F7F3ED] shadow-[0_12px_34px_rgba(45,38,29,.08)]">
              <div className="bg-gradient-to-br from-[#344B61] to-[#202B34] px-5 py-5 text-white sm:px-6 sm:py-6">
                <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-[#B7C5D0]">Panel del organizador</p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl leading-tight sm:text-4xl">Confirmaciones</h3>
                <p className="mt-2 text-xs text-white/80 sm:text-sm">Boda Sofía y Alejandro · 5 de diciembre</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-3.5 sm:gap-3 sm:p-4">
                <div className="rounded-xl border border-[#E7DFD3] bg-white p-3 sm:p-4"><p className="font-[var(--font-display)] text-2xl font-semibold text-[#332B27]">5</p><p className="mt-1 text-xs text-[#746A5D]">Invitaciones</p></div>
                <div className="rounded-xl border border-[#E7DFD3] bg-white p-3 sm:p-4"><p className="font-[var(--font-display)] text-2xl font-semibold text-[#725A3C]">10</p><p className="mt-1 text-xs text-[#746A5D]">Pases asignados</p></div>
                <div className="rounded-xl border border-[#D7E7DA] bg-white p-3 sm:p-4"><p className="font-[var(--font-display)] text-2xl font-semibold text-[#34734D]">1</p><p className="mt-1 text-xs text-[#746A5D]">Confirmados</p></div>
                <div className="rounded-xl border border-[#F0DFC0] bg-white p-3 sm:p-4"><p className="font-[var(--font-display)] text-2xl font-semibold text-[#947044]">4</p><p className="mt-1 text-xs text-[#746A5D]">Por responder</p></div>
              </div>
              <div className="border-t border-[#E6DED1] px-4 py-3.5 sm:px-5"><p className="text-xs leading-5 text-[#746A5D]">Consulta las respuestas y lleva el control de los pases de cada invitación.</p></div>
            </article>
            <article className="overflow-hidden rounded-[1.35rem] border border-[#E6DED1] bg-[#F7F3ED] shadow-[0_12px_34px_rgba(45,38,29,.08)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#E6DED1] bg-white px-4 py-4 sm:px-5">
                <div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#A88249]">Tu evento · Organización</p><h3 className="mt-1 font-[var(--font-display)] text-xl font-semibold text-[#332B27]">Lista de invitados</h3><p className="mt-1 text-xs text-[#746A5D]">Pases y respuestas en un vistazo</p></div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCC69D] bg-[#FCFAF6] text-[#725A3C]"><Users size={20} strokeWidth={1.7} /></span>
              </div>
              <div>
                {[
                  { name: "Carlos Ramírez", group: "Amigos de la universidad", passes: "2 pases", status: "Por responder", sent: "Sin enviar", color: "text-[#A65B20]" },
                  { name: "María González", group: "Familia González", passes: "3 pases", status: "Por responder", sent: "Sin enviar", color: "text-[#A65B20]" },
                  { name: "Carlos López", group: "Trabajo", passes: "2 pases", status: "Confirmó · 1", sent: "Enviada", color: "text-[#287247]" },
                ].map((guest) => (
                  <div key={guest.name} className="border-b border-[#E6DED1] px-4 py-3.5 last:border-b-0 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#332B27]">{guest.name}</p><p className="mt-0.5 truncate text-xs text-[#746A5D]">{guest.group}</p></div>
                      <span className={`shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-medium ${guest.color}`}>{guest.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#746A5D]"><span>{guest.passes}</span><span>·</span><span>{guest.sent}</span></div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E6DED1] bg-white px-4 py-3.5 sm:px-5"><p className="text-xs leading-5 text-[#746A5D]">Identifica rápidamente a quién contactar y qué invitaciones faltan por enviar.</p></div>
            </article>
          </div>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E1D5C4] bg-[#F8F4EC] p-4 text-center sm:flex-row sm:px-5 sm:text-left">
            <div><p className="text-sm font-semibold text-[#263D4B]">Más organización, menos pendientes.</p><p className="mt-1 text-xs leading-5 text-[#625A50]">Incluido en Invitación Plus por $349 MXN, pago único.</p></div>
            <PriceLink href={INVITATION_PLUS_URL} tone="gold">Comprar Invitación Plus</PriceLink>
          </div>
          <p className="mt-3 text-center text-[10px] leading-4 text-[#8A8073]">Vista ilustrativa del panel basada en sus funciones; los datos mostrados son ejemplos.</p>
        </div>
      </section>

      <section id="galeria" className="scroll-mt-5 px-5 pb-6 sm:px-8 sm:pb-8">
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
