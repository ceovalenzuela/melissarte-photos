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
  MonitorPlay,
  QrCode,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const demoUrl =
  "https://fotos.melissartedecorativo.com/e/boda-sofia-y-alejandro";

const purchaseUrl =
  "https://melissartedecorativo.com/products/galeria-digital";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F6F2] text-[#1F1F1F]">
      {/* Hero */}
      <section className="relative px-5 pb-10 pt-5 sm:px-8 sm:pb-14 sm:pt-7">
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

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:mt-12">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
                Galería digital para eventos
              </p>

              <h1 className="mt-4 font-[var(--font-display)] text-[clamp(3.2rem,11vw,5.7rem)] font-semibold leading-[0.86] tracking-[-0.035em] text-[#1F1F1F]">
                Todos los momentos.
                <span className="block text-[#A88249]">En un solo lugar.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#625A50] sm:text-lg sm:leading-8 lg:mx-0">
                Fotos, mensajes escritos y voces de tus invitados, reunidos en
                una galería creada especialmente para tu evento.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
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

              <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#7D7467] lg:justify-start">
                <span>Fotos ilimitadas</span>
                <span>QR + enlace</span>
                <span>Mensajes escritos y de voz</span>
                <span>30 días</span>
              </div>
            </div>

            {/* Editorial product preview */}
            <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
              <div className="absolute -left-3 top-12 hidden h-28 w-28 rounded-full bg-[#E8D8BE]/70 blur-3xl sm:block" />
              <div className="absolute -right-4 bottom-4 hidden h-40 w-40 rounded-full bg-[#D9D0C2]/70 blur-3xl sm:block" />

              <div className="relative rounded-[2rem] bg-[#1B1A17] p-3 shadow-[0_30px_80px_rgba(31,31,31,0.2)] sm:p-4">
                <div className="overflow-hidden rounded-[1.5rem] bg-[#F7F3EC]">
                  <div className="relative h-[470px] sm:h-[540px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#574E43_0%,#27241F_40%,#171613_100%)]" />

                    <div className="absolute inset-x-0 top-0 px-6 pb-7 pt-7 sm:px-8 sm:pt-8">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
                        Galería en vivo
                      </div>
                      <div className="mt-3 max-w-[13ch] font-[var(--font-display)] text-4xl font-semibold leading-[0.9] tracking-[-0.03em] text-white sm:text-5xl">
                        Sofía & Alejandro
                      </div>
                      <div className="mt-3 text-xs text-white/65">
                        12 de septiembre de 2026
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-5 sm:pb-5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="h-36 rounded-[1.2rem] bg-[linear-gradient(135deg,#CDBA9D,#6D5A48_48%,#292621)] shadow-lg sm:h-44" />
                        <div className="h-36 rounded-[1.2rem] bg-[linear-gradient(135deg,#8D7B67,#D8CBB9_52%,#453B31)] shadow-lg sm:h-44" />
                        <div className="h-28 rounded-[1.2rem] bg-[linear-gradient(135deg,#B3A28D,#51463B_52%,#25211E)] shadow-lg sm:h-32" />
                        <div className="h-28 rounded-[1.2rem] bg-[linear-gradient(135deg,#D9C8AD,#8A735A_52%,#3D332B)] shadow-lg sm:h-32" />
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                      Fotos + recuerdos
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-4 hidden w-64 rotate-[-3deg] rounded-[1.35rem] border border-white/80 bg-[#FFFDF9]/95 p-4 shadow-[0_18px_50px_rgba(31,31,31,0.14)] backdrop-blur sm:block">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1E7D7] text-[#A88249]">
                    <Mic size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A88249]">
                      Mensaje de voz
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#332F2A]">
                      “Los queremos muchísimo...”
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-[#E5DDD2]">
                      <div className="h-1 w-2/3 rounded-full bg-[#A88249]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 top-1/2 hidden w-56 translate-y-2 rotate-[3deg] rounded-[1.35rem] border border-white/80 bg-[#1F1D19]/95 p-4 shadow-[0_18px_50px_rgba(31,31,31,0.2)] sm:block">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#D8BD91]">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Recuerdo compartido
                    </p>
                    <p className="mt-1 text-sm font-medium leading-5 text-white/90">
                      “Gracias por dejarnos ser parte de este día.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
              Libro de firmas digital
            </p>
            <h2 className="mt-4 max-w-xl font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Un recuerdo que también puedes volver a escuchar.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Los mensajes de tus invitados se convierten en parte de la
              historia de tu evento. Escritos para leerlos y voces para
              escucharlas otra vez.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {[
                ["Mensajes escritos", MessageCircle],
                ["Mensajes de voz", Mic],
                ["Libro de firmas en PDF", BookOpen],
                ["Audios en archivo ZIP", Download],
              ].map(([label, Icon]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <Icon size={17} className="shrink-0 text-[#D5BD94]" />
                  <span className="text-sm text-white/80">{label as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2.4rem] bg-[#D5BD94]/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#F6F1E8] p-4 text-[#28241F] shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              <div className="rounded-[1.45rem] border border-[#DCCFB9] bg-[#FFFCF7] p-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                      Libro de firmas
                    </p>
                    <h3 className="mt-2 font-[var(--font-display)] text-3xl font-semibold leading-none">
                      Sofía & Alejandro
                    </h3>
                  </div>
                  <BookOpen size={20} className="text-[#A88249]" />
                </div>

                <div className="mt-7 space-y-5">
                  <div>
                    <p className="font-[var(--font-display)] text-2xl italic leading-none">
                      “Que esta nueva etapa esté llena de momentos así.”
                    </p>
                    <p className="mt-2 text-[11px] text-[#80766A]">
                      Mariana · amiga
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F1E9DC] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#A88249]">
                        <Mic size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] text-[#7A7063]">
                          <span>Mensaje de voz</span>
                          <span>0:18</span>
                        </div>
                        <div className="mt-2 flex items-center gap-[3px]">
                          {[14, 22, 10, 28, 17, 24, 12, 30, 18, 25, 13, 21, 9, 27, 16, 24, 11, 20].map(
                            (height, index) => (
                              <span
                                key={index}
                                className="w-1 rounded-full bg-[#A88249]/65"
                                style={{ height }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E6DED2] pt-4">
                    <span className="text-xs text-[#7E7467]">18 recuerdos</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#A88249]">
                      Descargar PDF <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live experience */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
                Durante el evento
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
                Los recuerdos aparecen mientras suceden.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#6C645A]">
                Comparte el QR, deja que tus invitados participen y disfruta de
                las fotografías nuevas en tu galería en tiempo real.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  [QrCode, "Comparte tu QR", "Tus invitados entran sin descargar ninguna aplicación."],
                  [MonitorPlay, "Muestra las fotos", "Disfruta una presentación en vivo durante el evento."],
                  [Sparkles, "Guarda todo", "Al final conserva fotografías, mensajes y voces."],
                ].map(([Icon, title, text]) => (
                  <div key={title as string} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E7D7] text-[#A88249]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#28241F]">{title as string}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#756C61]">{text as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#E5DCCF] bg-[#FFFDF9] p-4 shadow-[0_18px_60px_rgba(74,59,40,0.08)] sm:p-5">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#F0ECE5]">
                <div className="grid grid-cols-3 gap-2 p-2 sm:gap-3 sm:p-3">
                  <div className="col-span-2 h-56 rounded-[1.2rem] bg-[linear-gradient(140deg,#CAB79B,#75624F_55%,#2F2A25)] sm:h-72" />
                  <div className="h-56 rounded-[1.2rem] bg-[linear-gradient(140deg,#A8957D,#D8CBBA_50%,#5A4B3D)] sm:h-72" />
                  <div className="h-32 rounded-[1.2rem] bg-[linear-gradient(140deg,#C4B29B,#6A5949_52%,#342D27)] sm:h-40" />
                  <div className="h-32 rounded-[1.2rem] bg-[linear-gradient(140deg,#D6C7B3,#8B755E_55%,#45392F)] sm:h-40" />
                  <div className="h-32 rounded-[1.2rem] bg-[linear-gradient(140deg,#A58C70,#D7CAB9_55%,#4A4037)] sm:h-40" />
                </div>

                <div className="border-t border-black/5 bg-[#FFFCF7] px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-[var(--font-display)] text-2xl font-semibold">
                        Sofía & Alejandro
                      </p>
                      <p className="mt-1 text-xs text-[#81776A]">
                        124 fotos · 18 recuerdos
                      </p>
                    </div>
                    <Link
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#1F1F1F] px-4 text-xs font-medium text-white"
                    >
                      Explorar
                      <ArrowRight size={14} className="ml-1.5" />
                    </Link>
                  </div>
                </div>
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
            ].map(([number, title, text], index) => (
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
