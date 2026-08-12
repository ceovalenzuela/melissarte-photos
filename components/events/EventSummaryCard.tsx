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
    <section className="-mt-14 relative z-20 mx-auto w-[92%] max-w-2xl">
      <div className="rounded-3xl bg-[#FDFBF8] p-4 shadow-lg">
        {welcomeMessage && (
          <>
            <p className="whitespace-pre-wrap px-2 text-center text-base leading-6 text-[#5C554B]">
              {welcomeMessage}
            </p>

            <div className="my-4 h-px bg-[#E7DCC8]" />
          </>
        )}

        <div className="flex justify-center">
          {children}
        </div>
      </div>
    </section>
  );
}