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
    <section className="-mt-10 relative z-20 mx-auto w-[92%] max-w-2xl">
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex justify-center">
          {children}
        </div>

        {welcomeMessage && (
          <>
            <div className="my-6 h-px bg-neutral-200" />

            <p className="text-center text-neutral-600 leading-relaxed">
              {welcomeMessage}
            </p>
          </>
        )}

        <div className="my-6 h-px bg-neutral-200" />

        <div className="text-center">
          <p className="text-3xl font-semibold text-neutral-900">
            {totalPhotos}
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            fotografías
          </p>
        </div>
      </div>
    </section>
  );
}