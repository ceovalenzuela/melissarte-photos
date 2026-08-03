"use client";

interface Props {
  totalPhotos: number;
  welcomeMessage?: string;
  children: React.ReactNode;
}

export default function EventSummaryCard({
  totalPhotos,
  welcomeMessage,
  children,
}: Props) {
  return (
    <section className="-mt-20 relative z-20 mx-auto w-[92%] max-w-2xl">
      <div className="rounded-3xl bg-[#FDFBF8] p-6 shadow-lg">
        <div className="flex justify-center">
          {children}
        </div>

        {welcomeMessage && (
          <>
            <div className="my-6 h-px bg-[#E7DCC8]" />

            <p className="text-center text-[#5C554B] leading-relaxed">
              {welcomeMessage}
            </p>
          </>
        )}

        <div className="my-6 h-px bg-[#E7DCC8]" />

        <div className="text-center">
          <p className="text-3xl font-semibold text-[#B08D57]">
            {totalPhotos}
          </p>

          <p className="mt-1 text-sm text-[#7D7467]">
            fotografías
          </p>
        </div>
      </div>
    </section>
  );
}