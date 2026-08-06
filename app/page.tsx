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
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}

        <section className="py-12 text-center">

          <div className="mb-6 flex justify-center">
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

          <h2 className="mt-8 text-3xl font-medium leading-tight text-[#1F1F1F]">
            Todos los recuerdos de tu evento, en un solo lugar.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-[#5C554B]">
            Reúne en un solo lugar las fotografías que tú y tus invitados
            capturen durante uno de los días más importantes.
          </p>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#7D7467]">
            Tú y tus invitados podrán compartir fotografías fácilmente desde
            cualquier dispositivo y disfrutar todos los recuerdos en una sola
            galería, sin instalar aplicaciones.
          </p>

        </section>

        {/* Beneficios */}

        <section className="mt-10">

          <div className="grid gap-5 md:grid-cols-2">

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-6">
              <CheckCircle2
                className="mt-1 shrink-0 text-[#A88249]"
                size={20}
              />

              <p className="leading-7 text-[#5C554B]">
                <strong className="text-[#1F1F1F]">
                  Todos pueden compartir.
                </strong>

                <br />

                Tú y tus invitados pueden subir fotografías fácilmente desde
                cualquier celular.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-6">
              <CheckCircle2
                className="mt-1 shrink-0 text-[#A88249]"
                size={20}
              />

              <p className="leading-7 text-[#5C554B]">
                <strong className="text-[#1F1F1F]">
                  Sin instalar aplicaciones.
                </strong>

                <br />

                Solo escanea el código QR o abre el enlace de la galería.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-6">
              <CheckCircle2
                className="mt-1 shrink-0 text-[#A88249]"
                size={20}
              />

              <p className="leading-7 text-[#5C554B]">
                <strong className="text-[#1F1F1F]">
                  Todos los recuerdos en un solo lugar.
                </strong>

                <br />

                Reúne las fotografías de todos en una sola galería privada.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F3EC] p-6">
              <CheckCircle2
                className="mt-1 shrink-0 text-[#A88249]"
                size={20}
              />

              <p className="leading-7 text-[#5C554B]">
                <strong className="text-[#1F1F1F]">
                  Descarga todas las fotografías.
                </strong>

                <br />

                Conserva todos los recuerdos del evento en un solo archivo ZIP.
              </p>
            </div>

          </div>

        </section>

        {/* Cómo funciona */}

        <section className="mt-20 rounded-3xl bg-[#F7F3EC] p-10">

          <h2 className="text-center text-3xl font-semibold text-[#1F1F1F]">
            ¿Cómo funciona?
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                1
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Comparte el código QR
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Compártelo con tus invitados para acceder fácilmente a la
                galería.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                2
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Compartan sus fotografías
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Tú y tus invitados suben los mejores momentos capturados durante
                el evento.
              </p>

            </div>

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#A88249]">
                3
              </div>

              <h3 className="font-semibold text-[#1F1F1F]">
                Disfruten los recuerdos
              </h3>

              <p className="mt-3 leading-7 text-[#7D7467]">
                Todas las fotografías quedan reunidas en una sola galería para
                revivir cada momento.
              </p>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="mt-20 text-center">

          <h2 className="text-3xl font-semibold text-[#1F1F1F]">
            ¿Te gustaría ofrecer esta experiencia en tu evento?
          </h2>

          <p className="mt-5 text-lg text-[#5C554B]">
            Perfecto para{" "}
            <span className="font-medium text-[#1F1F1F]">
              bodas, XV años, cumpleaños y eventos corporativos.
            </span>
          </p>

          <Link
  href="https://wa.me/525649445427"
  target="_blank"
  className="inline-block mt-8"
>
  <Button
    className="
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

        {/* Contacto */}

        <footer className="mt-20 border-t border-[#E7DCC8] py-10">

          <h3 className="text-center text-xl font-semibold text-[#1F1F1F]">
            MelissArte Photos
          </h3>

          <p className="mt-2 text-center text-[#7D7467]">
            Galerías digitales para eventos.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8">

            <a
              href="https://wa.me/TUNUMERO"
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

          <p className="mt-10 text-center text-sm text-[#A39A8E]">
            © 2026 MelissArte Photos
          </p>

        </footer>

      </div>
    </main>
  );
}