import Link from "next/link";
import {
  Camera,
  Images,
  Download,
  QrCode,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF8] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">

        <div className="w-full rounded-3xl border border-[#E7DCC8] bg-white p-10 shadow-sm md:p-14">

          <div className="text-center">

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F3EC]">
                <Images
                  size={30}
                  className="text-[#A88249]"
                />
              </div>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F] md:text-5xl">
              MelissArte Photos
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5C554B]">
              Comparte y conserva las fotografías de tu evento.
            </p>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6">

              <QrCode
                className="text-[#A88249]"
                size={24}
              />

              <h2 className="mt-5 font-semibold text-[#1F1F1F]">
                Comparte
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7D7467]">
                Comparte tu galería mediante un código QR.
              </p>

            </div>

            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6">

              <Camera
                className="text-[#A88249]"
                size={24}
              />

              <h2 className="mt-5 font-semibold text-[#1F1F1F]">
                Captura momentos
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7D7467]">
                Los invitados pueden subir fotografías desde cualquier dispositivo.
              </p>

            </div>

            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8] p-6">

              <Download
                className="text-[#A88249]"
                size={24}
              />

              <h2 className="mt-5 font-semibold text-[#1F1F1F]">
                Descarga
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7D7467]">
                Descarga todas las imágenes en alta calidad.
              </p>

            </div>

          </div>

          <div className="mt-14 rounded-2xl bg-[#F7F3EC] px-8 py-8 text-center">

            <h3 className="text-xl font-semibold text-[#1F1F1F]">
              ¿Buscas una galería?
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-[#7D7467]">
              Accede mediante el enlace o código QR proporcionado por los organizadores del evento.
            </p>

          </div>

          <div className="mt-12 text-center">

            <Link
              href="/admin/login"
              className="
                inline-flex
                items-center
                rounded-full
                bg-[#A88249]
                px-7
                py-3
                font-medium
                text-white
                transition-colors
                hover:bg-[#977640]
              "
            >
              Acceso administrador
            </Link>

          </div>

          <p className="mt-12 text-center text-sm text-[#A39A8E]">
            MelissArte Photos · Galerías digitales para eventos
          </p>

        </div>

      </div>
    </main>
  );
}