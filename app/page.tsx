import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
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

      {/* After the event */}
      <section className="bg-[#1B1A17] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
              Tu galería, contigo
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Los recuerdos no terminan esa noche.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Tu galería se habilita 1 día antes del evento y permanece disponible
              durante la celebración y hasta 30 días después.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                <Camera size={19} />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-semibold">
                  Comparte en vivo
                </p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  Puedes proyectar la galería y ver cómo aparecen las fotografías mientras sucede el evento.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                <Download size={19} />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-semibold">
                  Conserva todo
                </p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  Descarga tus fotografías y, si elegiste Recuerdos, también tus mensajes y audios.
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
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Elige tu experiencia
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] text-[#1F1F1F] sm:text-5xl">
              Tú decides cómo guardar el recuerdo.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#6C645A]">
              Ambas opciones incluyen una galería personalizada, QR y enlace para compartir, fotografías ilimitadas y presentación en vivo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.8rem] border border-[#E4DACD] bg-[#FFFDF9] p-7 shadow-[0_12px_40px_rgba(74,59,40,0.05)] sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                    📸 Galería Esencial
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#6D655B]">
                    Para reunir y compartir las fotografías de tu evento en un solo lugar.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[var(--font-display)] text-4xl font-semibold leading-none text-[#A88249]">
                    $349
                  </p>
                  <p className="mt-1 text-xs text-[#8B8174]">MXN</p>
                </div>
              </div>

              <div className="mt-7 space-y-3 border-t border-[#EAE2D8] pt-6">
                {[
                  "Fotografías ilimitadas",
                  "QR y enlace personalizado",
                  "Galería con nombre, fecha, portada y bienvenida",
                  "Modo presentación en vivo",
                  "Descarga de fotografías en ZIP",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />
                    <span className="text-sm leading-6 text-[#615950]">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="https://melissartedecorativo.com/products/galeria-digital-para-tu-evento?variant=67687177715805">
                <Button variant="outline" className="mt-7 h-12 w-full rounded-full border-[#D1C2AC] bg-[#FBFAF8] text-sm font-medium text-[#2A2723] hover:bg-white">
                  Elegir Galería Esencial
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>
            </article>

            <article className="relative rounded-[1.8rem] border border-[#CDB990] bg-[#F3ECE2] p-7 shadow-[0_14px_45px_rgba(74,59,40,0.08)] sm:p-9">
              <span className="absolute right-6 top-6 rounded-full bg-[#A88249] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Más completa
              </span>

              <div className="flex items-start justify-between gap-4 pr-24 pt-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6D3B]">
                    ✨ Galería Recuerdos
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#6D655B]">
                    Además de las fotografías, conserva las palabras y voces de tus invitados.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[var(--font-display)] text-4xl font-semibold leading-none text-[#A88249]">
                    $449
                  </p>
                  <p className="mt-1 text-xs text-[#8B8174]">MXN</p>
                </div>
              </div>

              <div className="mt-7 border-t border-[#DCCDB6] pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6D3B]">
                  Incluye todo lo de Esencial, más:
                </p>
                <div className="space-y-3">
                  {[
                    "Mensajes escritos de tus invitados",
                    "Mensajes de voz de hasta 60 segundos",
                    "Libro de firmas digital en PDF",
                    "Mensajes de voz descargables en ZIP",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />
                      <span className="text-sm leading-6 text-[#615950]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="https://melissartedecorativo.com/products/galeria-digital-para-tu-evento?variant=67687177748573">
                <Button className="mt-7 h-12 w-full rounded-full bg-[#1F1F1F] text-sm font-medium text-white hover:bg-[#2E2B27]">
                  Elegir Galería Recuerdos
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>
            </article>
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
