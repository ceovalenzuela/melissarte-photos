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
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra tus eventos y galerías.
          </p>
        </div>

        {children}
      </div>
    </header>
  );
}