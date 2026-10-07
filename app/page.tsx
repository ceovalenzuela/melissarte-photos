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
              Fotos, mensajes escritos y voces de tus invitados, reunidos en
              una galería creada especialmente para tu evento.
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

      {/* Promise */}
      <section className="border-t border-[#EAE2D8] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              No guardes solo las fotos
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] text-[#1F1F1F] sm:text-5xl">
              Guarda también lo que se sintió.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#6C645A]">
              Cada invitado puede aportar algo distinto. Una fotografía, unas
              palabras o incluso su propia voz.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Camera,
                eyebrow: "01 · Fotografías",
                title: "Todos comparten",
                text: "Reúne las fotos que tus invitados tomaron desde sus propios celulares.",
              },
              {
                icon: MessageCircle,
                eyebrow: "02 · Mensajes",
                title: "Palabras que quedan",
                text: "Dedicatorias, recuerdos y buenos deseos que podrás conservar después del evento.",
              },
              {
                icon: Mic,
                eyebrow: "03 · Voces",
                title: "Escucha el momento",
                text: "Mensajes de voz de quienes estuvieron ahí, para volver a escucharlos cuando quieras.",
              },
            ].map(({ icon: Icon, eyebrow, title, text }) => (
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

      {/* Book of signatures */}
      <section className="bg-[#1B1A17] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
              Libro de firmas digital
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Un recuerdo que también puedes volver a escuchar.
            </h2>
            <p className="mt-6 text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Los mensajes de tus invitados se convierten en parte de la
              historia de tu evento. Escritos para leerlos y voces para
              escucharlas otra vez.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {[
              ["Mensajes escritos", MessageCircle],
              ["Mensajes de voz", Mic],
              ["Libro de firmas en PDF", BookOpen],
              ["Audios en archivo ZIP", Download],
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
              >
                <Icon size={17} className="shrink-0 text-[#D5BD94]" />
                <span className="text-sm text-white/80">{label as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#EEE8DE] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Así de fácil
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] sm:text-5xl">
              Comparte. Vive. Recuerda.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Comparte", "Coloca el QR o comparte el enlace de tu galería con tus invitados."],
              ["02", "Vive", "Recibe fotos, mensajes escritos y audios mientras el evento sucede."],
              ["03", "Recuerda", "Descarga tus fotografías, el libro de firmas y los mensajes de voz."],
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

      {/* Demo CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.2rem] bg-[#1B1A17] px-6 py-12 text-center text-white shadow-[0_30px_80px_rgba(31,31,31,0.18)] sm:px-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
            Conoce la experiencia
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
            Una galería que se siente como parte del evento.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Explora una galería demo y descubre cómo tus invitados pueden
            compartir fotos, dejar recuerdos y grabar su voz.
          </p>
          <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
            <Button className="mt-8 h-12 rounded-full bg-[#D5BD94] px-7 text-sm font-medium text-[#211E1A] hover:bg-[#E2CFAD]">
              Ver galería demo
              <ArrowRight size={17} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid overflow-hidden rounded-[2.2rem] border border-[#E4DACD] bg-[#FFFDF9] shadow-[0_18px_60px_rgba(74,59,40,0.07)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[#EEE7DC] p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
                Precio de lanzamiento
              </p>
              <h2 className="mt-4 max-w-sm font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em]">
                Tu historia merece quedarse.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#6E665C]">
                Crea una galería personalizada para tu boda, XV años o evento
                especial.
              </p>

              <div className="mt-8 flex items-end gap-3">
                <span className="text-sm text-[#8B8174] line-through">$449 MXN</span>
                <span className="font-[var(--font-display)] text-6xl font-semibold leading-none text-[#A88249]">
                  $349
                </span>
                <span className="mb-1 text-sm font-medium text-[#7A6A52]">MXN</span>
              </div>

              <p className="mt-2 text-sm font-medium text-[#A88249]">Ahorras $100 MXN</p>

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
                {[
                  "Fotografías ilimitadas",
                  "QR y enlace personalizado",
                  "Presentación de fotos en vivo",
                  "Mensajes escritos de invitados",
                  "Mensajes de voz de invitados",
                  "Libro de firmas en PDF",
                  "Descarga de audios en ZIP",
                  "Disponible durante el evento y 30 días después",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check size={17} className="mt-0.5 shrink-0 text-[#A88249]" />
                    <span className="text-sm leading-6 text-[#615950]">{item}</span>
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
          <p className="font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] text-[#1F1F1F] sm:text-5xl">
            Hay momentos que pasan una sola vez.
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-4xl font-semibold leading-none tracking-[-0.025em] text-[#A88249] sm:text-5xl">
            Haz que todos puedan quedarse contigo.
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
              <span className="text-xs text-[#81786D]">Un servicio de MelissArte.</span>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://wa.me/525649445427"
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
