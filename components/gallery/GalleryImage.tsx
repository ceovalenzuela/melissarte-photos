"use client";

import { memo, useState } from "react";

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
      className="
        group
        relative
        aspect-square
        overflow-hidden
        rounded-xl
        bg-neutral-100
        transition-transform
        duration-200
        active:scale-[0.985]
        focus:outline-none
        focus:ring-2
        focus:ring-neutral-300
        focus:ring-offset-2
      "
    >
      {!error ? (
        <>
          {!loaded && (
            <div
              className="
                absolute
                inset-0
                animate-pulse
                bg-neutral-100
              "
            />
          )}

          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={[
              "h-full w-full object-cover",
              "transition-all duration-500 ease-out",
              loaded
                ? "scale-100 opacity-100"
                : "scale-[1.025] opacity-0",
              "group-hover:scale-[1.02]",
            ].join(" ")}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setError(true);
            }}
          />

          {/* Sutil acabado al pasar el cursor */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/[0.03]
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          />
        </>
      ) : (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-neutral-100
            text-sm
            text-neutral-400
          "
        >
          Sin imagen
        </div>
      )}
    </button>
  );
}

export default memo(GalleryImage);