import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}

        <section className="py-8 text-center">

          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F3EC]">
              <Camera
                size={30}
                className="text-[#A88249]"
              />
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F]">
            MelissArte Photos
          </h1>

          <h2 className="mt-6 text-3xl font-medium leading-tight text-[#1F1F1F]">
            Todos los recuerdos de tu evento,
            <br />
            en un solo lugar.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#5C554B]">
            Tú y tus invitados podrán compartir fotografías fácilmente,
            sin instalar aplicaciones.
          </p>

        </section>

        {/* Beneficios */}

        <section className="mt-10">

          <div className="grid gap-4 md:grid-cols-2">

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-5">
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-[#A88249]"
              />

              <div>
                <h3 className="font-semibold text-[#1F1F1F]">
                  Todos pueden compartir
                </h3>

                <p className="mt-1 text-[#5C554B]">
                  Sube fotografías desde cualquier celular.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-5">
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-[#A88249]"
              />

              <div>
                <h3 className="font-semibold text-[#1F1F1F]">
                  Sin instalar aplicaciones
                </h3>

                <p className="mt-1 text-[#5C554B]">
                  Solo escanea el código QR.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-5">
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-[#A88249]"
              />

              <div>
                <h3 className="font-semibold text-[#1F1F1F]">
                  Todos los recuerdos en un solo lugar
                </h3>

                <p className="mt-1 text-[#5C554B]">
                  Una sola galería para todos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-5">
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-[#A88249]"
              />

              <div>
                <h3 className="font-semibold text-[#1F1F1F]">
                  Descarga todo el evento
                </h3>

                <p className="mt-1 text-[#5C554B]">
                  Todas las fotografías en alta calidad.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* Cómo funciona */}

        <section className="mt-14 rounded-3xl bg-[#F7F3EC] p-8">

          <h2 className="text-center text-3xl font-semibold text-[#1F1F1F]">
            ¿Cómo funciona?
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-3">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white font-semibold text-[#A88249]">
                1
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Comparte el QR
              </h3>

              <p className="mt-2 text-[#7D7467]">
                Tus invitados acceden a la galería.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white font-semibold text-[#A88249]">
                2
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Suban fotografías
              </h3>

              <p className="mt-2 text-[#7D7467]">
                Cada persona comparte sus mejores momentos.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white font-semibold text-[#A88249]">
                3
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Disfruten los recuerdos
              </h3>

              <p className="mt-2 text-[#7D7467]">
                Todas las fotografías reunidas en un solo lugar.
              </p>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="mt-14 text-center">

          <h2 className="text-3xl font-semibold text-[#1F1F1F]">
            ¿Quieres una galería como esta para tu evento?
          </h2>

          <p className="mt-4 text-[#5C554B]">
            Bodas • XV Años • Cumpleaños • Eventos corporativos
          </p>

          <Link
            href="https://wa.me/521XXXXXXXXXX?text=Hola,%20me%20gustaría%20recibir%20información%20sobre%20MelissArte%20Photos."
            target="_blank"
            className="inline-block"
          >
            <Button
              className="
                mt-7
                h-12
                rounded-full
                bg-[#A88249]
                px-8
                hover:bg-[#977640]
              "
            >
              Solicitar información
            </Button>
          </Link>

        </section>

        {/* Footer */}

        <footer className="mt-16 border-t border-[#E7DCC8] py-8">

          <h3 className="text-center text-xl font-semibold text-[#1F1F1F]">
            MelissArte Photos
          </h3>

          <p className="mt-2 text-center text-[#7D7467]">
            Galerías digitales para eventos.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-8">

            <a
              href="https://wa.me/521XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#5C554B] transition-colors hover:text-[#A88249]"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <a
              href="mailto:contacto@melissarte.com"
              className="flex items-center gap-2 text-[#5C554B] transition-colors hover:text-[#A88249]"
            >
              <Mail size={18} />
              Correo electrónico
            </a>

          </div>

          <p className="mt-8 text-center text-sm text-[#A39A8E]">
            © 2026 MelissArte Photos
          </p>

        </footer>

      </div>
    </main>
  );
}