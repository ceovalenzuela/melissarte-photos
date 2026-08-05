"use client";

import { ReactNode } from "react";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth";

type AppHeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function AppHeader({
  title,
  children,
}: AppHeaderProps) {

const router = useRouter();

async function handleLogout() {
  try {
    await signOut();

    router.replace("/admin/login");
  } catch (error) {
    console.error(error);

    alert("No fue posible cerrar la sesión.");
  }
}

  return (
  <header className="mx-auto max-w-7xl px-6 pt-6">
    <div className="rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] px-8 py-7 shadow-sm">
      <div className="flex flex-col gap-6">

        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#E7DCC8]
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-[#5C554B]
              transition-colors
              hover:bg-[#F7F3EC]
            "
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#1F1F1F]">
              {title}
            </h1>

            <p className="mt-2 text-[#7D7467]">
              Administra tus eventos y galerías.
            </p>
          </div>

          {children}
        </div>

      </div>
    </div>
  </header>
);
}