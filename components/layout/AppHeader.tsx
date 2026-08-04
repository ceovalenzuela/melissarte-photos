import { ReactNode } from "react";

type AppHeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function AppHeader({
  title,
  children,
}: AppHeaderProps) {
  return (
    <header className="mx-auto max-w-7xl px-6 pt-6">
      <div className="rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] px-8 py-7 shadow-sm">
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
    </header>
  );
}