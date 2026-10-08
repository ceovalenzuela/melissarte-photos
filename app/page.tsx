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

const galleryPhotos = [
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/4907817f-65a5-4872-a2fc-8e9a710be6d8.webp",
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/93ec353b-5b74-42cb-ae0b-f17a75a40b03.webp",
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/371d072e-6887-4399-9f04-c94a53b9e1ff.webp",
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/53ed537a-e016-40e7-8842-6a30758e23ac.webp",
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/565a3b0d-24f0-4fd3-9bd9-d907783d9dd9.webp",
  "https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-photos/061b9c0c-3688-4a8d-b24d-cdf0c296318c/thumbnails/32d4c2bf-fd05-413f-9004-a0325a5c04ec.webp",
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

          {/* Faithful mobile gallery preview */}
          <div className="mx-auto mt-12 max-w-[340px]">
            <div className="overflow-hidden rounded-[2rem] border border-[#E2D8CA] bg-[#FBF9F5] shadow-[0_30px_80px_rgba(48,38,25,0.13)]">
              <div className="px-2.5 py-2 sm:px-3">
                {/* Real mobile cover */}
                <div className="relative aspect-[0.88] overflow-hidden rounded-[1.35rem] bg-[#E8E0D5]">
                  <Image
                    src="https://frnmkhffpbykbtvhpkxq.supabase.co/storage/v1/object/public/event-covers/061b9c0c-3688-4a8d-b24d-cdf0c296318c-1791435877254.png"
                    alt="Portada real de Boda Sofía y Alejandro"
                    fill
                    priority
                    sizes="360px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <p className="font-[var(--font-display)] text-[1.65rem] font-semibold leading-[0.9] tracking-[-0.025em]">
                      Boda Sofía
                      <br />
                      y Alejandro
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/85">
                      <span>▣</span>
                      3 de octubre de 2026
                    </p>
                  </div>
                </div>

                {/* Real mobile welcome card */}
                <div className="relative z-10 mx-3 -mt-3 rounded-[1.35rem] border border-[#E8DFD4] bg-white px-5 py-5 text-center shadow-[0_14px_35px_rgba(74,59,40,0.10)]">
                  <p className="font-[var(--font-display)] text-[15px] font-medium leading-5 text-[#302B25]">
                    ¡Bienvenidos a nuestra galería! 💛
                  </p>
                  <p className="mt-5 text-[11px] leading-5 text-[#5F574D]">
                    Comparte las fotografías que tomaste durante nuestra boda y ayúdanos a guardar todos esos momentos.
                  </p>
                  <div className="my-4 h-px bg-[#EAE2D8]" />
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8B8174]">
                    Comparte tus momentos
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#C8AB7B] px-4 py-2 text-[9px] font-medium text-white shadow-sm">
                    <Camera size={11} />
                    Subir fotografías
                  </span>
                  <p className="mt-2 text-[8px] text-[#8B8174]">
                    Pronto podrás disfrutar de esta galería
                  </p>
                </div>

                {/* Real mobile live gallery header */}
                <div className="px-2.5 pb-5 pt-7 text-center">
                  <div className="flex items-center justify-center gap-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#A88249]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A88249]" />
                    Galería en vivo
                  </div>
                  <p className="mt-2 font-[var(--font-display)] text-[1.35rem] font-semibold leading-none text-[#302B25]">
                    Recuerdos de este día <span className="ml-1 text-[10px] font-normal text-[#A39A8F]">52</span>
                  </p>
                  <p className="mt-2 text-[9px] leading-4 text-[#81786D]">
                    Las nuevas fotografías aparecen aquí en tiempo real.
                  </p>
                </div>

                {/* Real mobile gallery controls */}
                <div className="flex items-center justify-between gap-2 px-2.5 pb-3">
                  <span className="rounded-full bg-[#1F1F1F] px-3 py-2 text-[8px] font-medium text-white">
                    ▶ Ver presentación en vivo
                  </span>
                  <span className="rounded-full border border-[#DCCFBD] bg-white px-3 py-2 text-[8px] text-[#7D7467]">
                    Más recientes⌄
                  </span>
                </div>

                {/* Real mobile photo masonry */}
                <div className="columns-2 gap-2.5 px-2.5 pb-2.5">
                  {galleryPhotos.slice(0, 5).map((photo, index) => (
                    <div key={photo} className="mb-2.5 break-inside-avoid overflow-hidden rounded-xl bg-[#E8E0D5]">
                      <Image
                        src={photo}
                        alt={`Fotografía real de la galería, ejemplo ${index + 1}`}
                        width={420}
                        height={520}
                        sizes="170px"
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-[#8B8174]">
              Así se verá tu galería desde el celular.
            </p>
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

          <div className="mt-12 space-y-6">
            <article className="grid overflow-hidden rounded-[1.8rem] border border-[#E5DCCF] bg-[#FFFDF9] shadow-[0_16px_45px_rgba(74,59,40,0.07)] md:grid-cols-[1.05fr_0.95fr] md:items-center">
              <div className="order-2 p-7 sm:p-9 md:order-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1E7D7] text-[#A88249]">
                  <Camera size={19} />
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                  01 · Fotografías
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl font-semibold leading-none tracking-[-0.02em] text-[#28241F] sm:text-4xl">
                  Todos comparten.
                </h3>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#6D655B]">
                  Tus invitados suben las fotos que toman durante el evento y aparecen en la galería mientras todo sucede.
                </p>
              </div>
              <div className="order-1 grid grid-cols-2 gap-2 bg-[#EEE8DE] p-3 md:order-2">
                {galleryPhotos.slice(0, 4).map((photo, index) => (
                  <div key={photo} className="relative aspect-[1.08] overflow-hidden rounded-2xl">
                    <Image
                      src={photo}
                      alt={`Fotografía compartida por invitados ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 45vw, 260px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[1.8rem] border border-[#E5DCCF] bg-[#F3ECE2] p-7 shadow-[0_12px_35px_rgba(74,59,40,0.05)] sm:p-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-[#A88249]">
                  <MessageCircle size={19} />
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                  02 · Mensajes
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl font-semibold leading-none tracking-[-0.02em] text-[#28241F]">
                  Palabras que quedan.
                </h3>
                <div className="mt-6 rounded-2xl border border-[#DED0BB] bg-[#FBF9F5] p-5 shadow-sm">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                    Comparte tus palabras
                  </p>
                  <p className="mt-3 font-[var(--font-display)] text-xl leading-tight text-[#302B25]">
                    “Qué bonito poder guardar este día para siempre.”
                  </p>
                  <p className="mt-3 text-xs text-[#8B8174]">
                    Dedicatorias y recuerdos de tus invitados.
                  </p>
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-[#E5DCCF] bg-[#FFFDF9] p-7 shadow-[0_12px_35px_rgba(74,59,40,0.05)] sm:p-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1E7D7] text-[#A88249]">
                  <Mic size={19} />
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A88249]">
                  03 · Voces
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-3xl font-semibold leading-none tracking-[-0.02em] text-[#28241F]">
                  Escucha sus voces.
                </h3>
                <div className="mt-6 rounded-2xl border border-[#E1D5C1] bg-[#F8F4EE] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                      <Mic size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 rounded-full bg-[#DCCEB9]">
                        <div className="h-1.5 w-[62%] rounded-full bg-[#A88249]" />
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] text-[#8B8174]">
                        <span>0:18</span>
                        <span>0:29</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#6D655B]">▶</span>
                  </div>
                  <p className="mt-3 text-xs text-[#8B8174]">
                    Mensajes de voz para volver a escuchar después.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Live presentation */}
      <section className="bg-[#1B1A17] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D5BD94]">
              Galería en vivo
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Tus recuerdos también pueden verse en vivo.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Proyecta la galería durante tu evento y deja que las fotografías de tus invitados aparezcan mientras sucede la celebración.
            </p>
            <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
              <Button className="mt-7 h-12 rounded-full bg-white px-6 text-sm font-medium text-[#1F1F1F] hover:bg-white/90">
                Ver presentación en vivo
                <ArrowRight size={17} className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.25)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.3rem]">
              <Image
                src={galleryPhotos[4]}
                alt="Presentación en vivo de la galería"
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D5BD94]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D5BD94]" />
                  Presentación en vivo
                </div>
                <p className="mt-2 font-[var(--font-display)] text-2xl font-semibold sm:text-3xl">
                  Boda Sofía y Alejandro
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Las fotografías aparecen conforme tus invitados las comparten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After the event */}
      <section className="bg-[#F8F6F2] px-5 py-16 text-[#1F1F1F] sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Tu galería, contigo
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl font-semibold leading-[0.9] tracking-[-0.03em] sm:text-6xl">
              Los recuerdos no terminan esa noche.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#6C645A] sm:text-lg sm:leading-8">
              Tu galería se habilita 1 día antes del evento y permanece disponible durante la celebración y hasta 30 días después.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[#E4DACD] bg-[#FFFDF9] p-6 shadow-[0_14px_40px_rgba(74,59,40,0.06)] sm:p-7">
            <div className="flex items-start gap-4 border-b border-[#EAE2D8] pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A88249] text-white">
                <Camera size={19} />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-semibold">
                  Comparte en vivo
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6D655B]">
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
                <p className="mt-1 text-sm leading-6 text-[#6D655B]">
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
              <div className="flex items-start justify-between gap-4 pt-8">
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
