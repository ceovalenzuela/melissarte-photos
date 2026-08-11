import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}

        <section className="py-10 text-center">

          <div className="mb-3 flex justify-center">
            <Image
              src="/me-logo.png"
              alt="MelissArte Photos"
              width={300}
              height={110}
              className="h-auto w-[220px]"
            />
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#1F1F1F] md:text-4xl">
            Revive cada momento
            <br />
            de tu evento.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5C554B]">
            Reúne las fotografías de tu evento en un solo lugar y permite que
            tus invitados también compartan sus fotos, directamente desde su
            celular.
          </p>

          <p className="mt-5 text-sm font-medium text-[#7D7467]">
            Sin aplicaciones. Sin registros. Solo escanea y comparte.
          </p>

        </section>

        {/* Beneficios */}

        <section className="mt-7">
          <div className="grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl bg-[#F7F3EC] p-6">
              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="mt-1 shrink-0 text-[#A88249]"
                />

                <div>

                  <h3 className="font-semibold text-[#1F1F1F]">
                    Comparte fácilmente
                  </h3>

                  <p className="mt-2 leading-7 text-[#5C554B]">
                    Tú y tus invitados pueden subir fotografías desde cualquier
                    celular.
                  </p>

                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F3EC] p-6">
              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="mt-1 shrink-0 text-[#A88249]"
                />

                <div>

                  <h3 className="font-semibold text-[#1F1F1F]">
                    Acceso mediante QR
                  </h3>

                  <p className="mt-2 leading-7 text-[#5C554B]">
                    Solo escanea el código QR o abre el enlace de la galería.
                  </p>

                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F3EC] p-6">
              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="mt-1 shrink-0 text-[#A88249]"
                />

                <div>

                  <h3 className="font-semibold text-[#1F1F1F]">
                    Una sola galería
                  </h3>

                  <p className="mt-2 leading-7 text-[#5C554B]">
                    Reúne las fotografías de todos en un mismo lugar para no
                    perder ningún recuerdo.
                  </p>

                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F3EC] p-6">
              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="mt-1 shrink-0 text-[#A88249]"
                />

                <div>

                  <h3 className="font-semibold text-[#1F1F1F]">
                    Descarga en alta calidad
                  </h3>

                  <p className="mt-2 leading-7 text-[#5C554B]">
                    Conserva todas las fotografías del evento en un solo archivo.
                  </p>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Cómo funciona */}

        <section className="mt-16 rounded-3xl bg-[#F7F3EC] p-8 md:p-10">

          <h2 className="text-center text-3xl font-semibold text-[#1F1F1F]">
            ¿Cómo funciona?
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                1
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Comparte el QR
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Tus invitados escanean el código y entran fácilmente a la
                galería.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                2
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Comparte tus fotos
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Cada invitado puede subir las fotografías que tomó durante el
                evento.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                3
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Guarda tus recuerdos
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Después del evento, descarga todas las fotografías desde tu
                galería.
              </p>

            </div>

          </div>
        </section>

        {/* Precio y CTA */}

        <section className="mt-16 text-center">

          <p className="text-sm font-medium uppercase tracking-wide text-[#A88249]">
            Galería Digital para tu evento
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#1F1F1F]">
            Todos tus recuerdos en un solo lugar.
          </h2>

          <div className="mx-auto mt-6 max-w-md rounded-3xl bg-[#F7F3EC] p-7">

            <p className="text-sm text-[#7D7467]">
              Galería personalizada
            </p>

            <p className="mt-2 text-4xl font-semibold text-[#1F1F1F]">
              $449 MXN
            </p>

            <div className="mt-5 space-y-2 text-sm text-[#5C554B]">
              <p>📸 Fotografías ilimitadas</p>
              <p>📱 QR y enlace para compartir</p>
              <p>⏰ Disponible durante el evento y 30 días después</p>
            </div>

            <Link
              href="https://melissartedecorativo.com/products/galeria-digital"
              className="mt-7 inline-block"
            >
              <Button
                className="
                  h-12
                  rounded-full
                  bg-[#A88249]
                  px-8
                  text-base
                  hover:bg-[#977640]
                "
              >
                Comprar mi galería
              </Button>
            </Link>

          </div>

        </section>

        {/* Footer */}

        <footer className="mt-20 border-t border-[#E7DCC8] py-8">

          <div className="flex justify-center">
            <Image
              src="/me-logo.png"
              alt="MelissArte Photos"
              width={140}
              height={50}
              className="h-auto w-[100px]"
            />
          </div>

          <p className="mt-1 text-center text-sm text-[#7D7467]">
            Un servicio de MelissArte.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8">

            <a
              href="https://wa.me/525649445427"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#5C554B] transition-colors hover:text-[#A88249]"
            >
              <MessageCircle size={18} />
              Habla con nosotros
            </a>

            <a
              href="mailto:melissartedecorativo@gmail.com"
              className="flex items-center gap-2 text-[#5C554B] transition-colors hover:text-[#A88249]"
            >
              <Mail size={18} />
              Correo electrónico
            </a>

          </div>

        </footer>

      </div>
    </main>
  );
}