import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center">
      <Link href="/" className="inline-block">
  <Image
    src="/me-logo.png"
    alt="MelissArte Photos"
    width={90}
    height={32}
    className="h-auto w-[90px]"
  />
</Link>

      <p className="mt-0 text-xs text-neutral-400">
        Tus recuerdos, en un solo lugar.
      </p>
    </footer>
  );
}