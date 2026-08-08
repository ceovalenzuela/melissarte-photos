import Image from "next/image";

export default function Footer() {
  return (
    <footer className="text-center">
      <Image
        src="/me-logo.png"
        alt="MelissArte Photos"
        width={90}
        height={32}
        className="mx-auto h-auto w-[90px]"
      />

      <p className="mt-1 text-xs text-neutral-400">
        Álbum colaborativo para eventos
      </p>
    </footer>
  );
}