import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Download,
  MessageCircle,
  Mic,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const demoUrl =
  "https://fotos.melissartedecorativo.com/e/boda-sofia-y-alejandro";

const purchaseUrl =
  "https://melissartedecorativo.com/products/galeria-digital-para-tu-evento";

const features = [
  {
    icon: Camera,
    eyebrow: "01 · Fotografías",
    title: "Todos comparten",
    text: "Tus invitados suben las fotos que toman durante el evento desde su celular.",
  },
  {
    icon: MessageCircle,
    eyebrow: "02 · Mensajes",
    title: "Palabras que quedan",
    text: "Recibe dedicatorias, recuerdos y buenos deseos que podrás conservar.",
  },
  {
    icon: Mic,
    eyebrow: "03 · Voces",
    title: "Escucha sus voces",
    text: "Mensajes de voz de quienes estuvieron ahí, para volver a escucharlos después.",
  },
];

const included = [
  "Fotografías ilimitadas",
  "QR y enlace personalizado",
  "Presentación de fotos en vivo",
  "Mensajes escritos y de voz",
  "Libro de firmas en PDF",
  "Audios en archivo ZIP",
  "Disponible durante el evento y 30 días después",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F2] text-[#1F1F1F]">
      {/* Hero */}
      <section className="relative px-5 pb-14 pt-5 sm:px-8 sm:pb-20 sm:pt-7">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-center">
            <Image
              src="/me-logo.png"
              alt="MelissArte Photos"
              width={300}
              height={110}
              priority
              className="h-auto w-[150px] sm:w-[175px]"
            />
          </header>

          <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Galería digital para eventos
            </p>

            <h1 className="mt-5 font-[var(--font-display)] text-[clamp(3.4rem,11vw,6.5rem)] font-semibold leading-[0.84] tracking-[-0.04em] text-[#1F1F1F]">
              Todos los momentos.
              <span className="block text-[#A88249]">En un solo lugar.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#625A50] sm:text-lg sm:leading-8">
              Tus invitados comparten fotos, mensajes y voces en una galería
              creada especialmente para tu evento.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  className="h-12 rounded-full bg-[#1F1F1F] px-7 text-sm font-medium text-white shadow-[0_14px_30px_rgba(31,31,31,0.14)] hover:bg-[#2E2B27]"
                >
                  Ver galería demo
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>

              <Link href={purchaseUrl}>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-[#D9CDBB] bg-[#FBFAF8] px-7 text-sm font-medium text-[#2A2723] hover:bg-white"
                >
                  Crear mi galería
                </Button>
              </Link>
            </div>

            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#7D7467]">
              <span>Fotos ilimitadas</span>
              <span>QR + enlace</span>
              <span>Mensajes escritos y de voz</span>
              <span>30 días</span>
            </div>
          </div>
        </div>
      </section>

      {/* What guests can add */}
      <section className="border-t border-[#EAE2D8] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Tu evento, visto por todos
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] text-[#1F1F1F] sm:text-5xl">
              Cada invitado deja algo.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#6C645A]">
              En lugar de pedir las fotos después, deja que todos las
              compartan mientras el evento sucede.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, eyebrow, title, text }) => (
              <article
                key={eyebrow}
                className="rounded-[1.6rem] border border-[#E5DCCF] bg-[#FFFDF9] p-7 shadow-[0_12px_35px_rgba(74,59,40,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1E7D7] text-[#A88249]">
                  <Icon size={19} />
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                  {eyebrow}
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl font-semibold leading-none tracking-[-0.02em] text-[#28241F]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6D655B]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Keep it after the event */}
      <section className="bg-[#1B1A17] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
              Después del evento
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Lo mejor no termina esa noche.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Cuando termine la celebración, tus recuerdos siguen contigo.
              Conserva las fotografías y descarga todo lo que tus invitados
              dejaron.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">
                Libro de firmas en PDF
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">
                Audios en ZIP
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">
                Fotografías
              </span>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                <BookOpen size={19} />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-semibold">
                  Libro de firmas
                </p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  Todos los mensajes escritos reunidos en un PDF.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                <Download size={19} />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-semibold">
                  Tus recuerdos, contigo
                </p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  Descarga tus fotos y mensajes de voz al terminar el evento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#EEE8DE] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Así funciona
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] sm:text-5xl">
              Tres pasos y listo.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Comparte",
                "Coloca el QR o comparte el enlace de tu galería con tus invitados.",
              ],
              [
                "02",
                "Disfruta",
                "Ellos suben fotos y dejan mensajes mientras el evento sucede.",
              ],
              [
                "03",
                "Conserva",
                "Al terminar, descarga tus fotos, el libro de firmas y los audios.",
              ],
            ].map(([number, title, text]) => (
              <article
                key={number}
                className="rounded-[1.6rem] border border-[#DED3C3] bg-[#F9F6F0] p-7"
              >
                <span className="font-[var(--font-display)] text-5xl font-semibold leading-none text-[#B89968]">
                  {number}
                </span>
                <h3 className="mt-5 font-[var(--font-display)] text-3xl font-semibold leading-none">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#756C61]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid overflow-hidden rounded-[2.2rem] border border-[#E4DACD] bg-[#FFFDF9] shadow-[0_18px_60px_rgba(74,59,40,0.07)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[#EEE7DC] p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
                Precio de lanzamiento
              </p>
              <h2 className="mt-4 max-w-sm font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em]">
                Una forma distinta de guardar tu evento.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#6E665C]">
                Crea una galería personalizada para tu boda, XV años o evento
                especial.
              </p>

              <div className="mt-8 flex items-end gap-3">
                <span className="text-sm text-[#8B8174] line-through">
                  $449 MXN
                </span>
                <span className="font-[var(--font-display)] text-6xl font-semibold leading-none text-[#A88249]">
                  $349
                </span>
                <span className="mb-1 text-sm font-medium text-[#7A6A52]">
                  MXN
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-[#A88249]">
                Ahorras $100 MXN
              </p>

              <Link href={purchaseUrl}>
                <Button className="mt-7 h-12 w-full rounded-full bg-[#1F1F1F] text-sm font-medium text-white hover:bg-[#2E2B27]">
                  Crear mi galería
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>
            </div>

            <div className="p-7 sm:p-10">
              <p className="text-sm font-medium text-[#2F2A25]">Todo incluido</p>

              <div className="mt-6 space-y-3">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-[#A88249]"
                    />
                    <span className="text-sm leading-6 text-[#615950]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
            Tu evento merece recordarse completo
          </p>

          <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-[0.95] tracking-[-0.025em] text-[#1F1F1F] sm:text-5xl">
            Haz que tus invitados también formen parte del recuerdo.
          </h2>

          <Link href={purchaseUrl}>
            <Button className="mt-8 h-12 rounded-full bg-[#A88249] px-8 text-sm font-medium text-white shadow-[0_14px_30px_rgba(168,130,73,0.18)] hover:bg-[#977640]">
              Crear mi galería
              <ArrowRight size={17} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5DCCF] bg-[#F8F6F2] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/me-logo.png"
                alt="MelissArte Photos"
                width={140}
                height={50}
                className="h-auto w-[90px]"
              />
              <span className="text-xs text-[#81786D]">
                Un servicio de MelissArte.
              </span>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://wa.me/528133867050"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#5F574D] transition-colors hover:text-[#A88249]"
              >
                WhatsApp
              </a>
              <a
                href="mailto:melissartedecorativo@gmail.com"
                className="text-xs font-medium text-[#5F574D] transition-colors hover:text-[#A88249]"
              >
                Correo
              </a>
            </div>
          </div>

          <div className="mt-5 text-center text-[11px] text-[#A0988E] sm:text-left">
            © {new Date().getFullYear()} MelissArte Photos
          </div>
        </div>
      </footer>
    </main>
  );
}
