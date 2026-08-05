import Link from "next/link";
import {
  Camera,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF8] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">

        <div className="w-full rounded-3xl border border-[#E7DCC8] bg-white px-8 py-10 shadow-sm md:px-12 md:py-14">

          {/* Logo */}

          <div className="text-center">

            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F3EC]">
                <Camera
  size={26}
  className="text-[#A88249]"
/>
              </div>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F]">
              MelissArte Photos
            </h1>

            <p className="mt-5 text-lg leading-8 text-[#5C554B]">
              Comparte los mejores momentos de tu evento.
            </p>

          </div>

          {/* Beneficios */}

          <div className="mx-auto mt-10 max-w-lg space-y-5">

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-[#A88249]"
              />

              <p className="text-[#5C554B]">
                Comparte tu galería mediante un código QR.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-[#A88249]"
              />

              <p className="text-[#5C554B]">
                Tus invitados pueden subir sus fotografías fácilmente.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-[#A88249]"
              />

              <p className="text-[#5C554B]">
                Descarga todas las fotografías en alta calidad.
              </p>
            </div>

          </div>

          {/* Información */}

          <div className="mt-10 rounded-2xl bg-[#F7F3EC] p-6 text-center">

            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              ¿Tienes un enlace o un código QR?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7D7467]">
              Accede a tu galería desde el enlace o código QR proporcionado
              por los organizadores del evento.
            </p>

          </div>

          {/* Botón */}

          <div className="mt-8 text-center">

            <Link
              href="/admin/login"
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-[#A88249]
                px-6
                py-3
                font-medium
                text-[#A88249]
                transition-colors
                hover:bg-[#F7F3EC]
              "
            >
              Acceso administrador
            </Link>

          </div>

          {/* Footer */}

          <p className="mt-10 text-center text-sm text-[#A39A8E]">
            MelissArte Photos · Galerías digitales para eventos
          </p>

        </div>

      </div>
    </main>
  );
}