"use client";

import { memo, useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  priority?: boolean;
  onClick: () => void;
}

function GalleryImage({
  src,
  alt,
  priority = false,
  onClick,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
    >
      {!error ? (
        <>
          {/* Skeleton */}
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-neutral-100" />
          )}

          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width:768px) 50vw, 33vw"
            className={[
              "object-cover",
              "transition-all duration-200 ease-out",
              loaded ? "opacity-100" : "opacity-0",
              "group-hover:scale-[1.02]",
            ].join(" ")}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setError(true);
            }}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          Sin imagen
        </div>
      )}
    </button>
  );
}

export default memo(GalleryImage);