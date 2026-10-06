"use client";

interface Props {
  welcomeMessage?: string;
  children: React.ReactNode;
}

export default function EventSummaryCard({
  welcomeMessage,
  children,
}: Props) {
  return (
    <section className="-mt-12 relative z-20 mx-auto w-[92%] max-w-3xl">
      <div className="rounded-[1.75rem] border border-white/70 bg-[#FDFBF8]/95 px-5 py-5 shadow-[0_18px_55px_rgba(53,44,34,0.12)] backdrop-blur-xl sm:px-6">
        {welcomeMessage && (
          <>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-[var(--font-display)] text-[1.15rem] font-medium leading-6 text-[#3F3A34] sm:text-[1.3rem] sm:leading-6">
                {welcomeMessage}
              </p>
            </div>

            <div className="my-4 h-px bg-[#E7DCC8]" />
          </>
        )}

        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9A9287]">
            Comparte tus momentos
          </p>

          {children}
        </div>
      </div>
    </section>
  );
}