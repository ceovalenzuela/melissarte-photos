"use client";

import { memo, useState } from "react";

interface Props {
  src: string;
  alt: string;
  priority?: boolean;
  animateOnLoad?: boolean;
  animationDelay?: number;
  subtleEntrance?: boolean;
  onClick: () => void;
}

function GalleryImage({
  src,
  alt,
  priority = false,
  animateOnLoad = true,
  animationDelay = 0,
  subtleEntrance = false,
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
          mb-2.5
          block
          w-full
          break-inside-avoid
          overflow-hidden
          rounded-[1.15rem]
          bg-neutral-100
          shadow-[0_8px_28px_rgba(53,44,34,0.06)]
          transition-transform
          duration-200
          active:scale-[0.985]
          focus:outline-none
          focus:ring-2
          focus:ring-neutral-300
          focus:ring-offset-2
          md:mb-3.5
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
              "relative z-10 block h-auto w-full",
              "transition-all duration-700 ease-out",
              loaded
                ? subtleEntrance
                  ? "scale-100 opacity-100 motion-safe:animate-[melissarte-gallery-enter_650ms_cubic-bezier(0.22,1,0.36,1)]"
                  : animateOnLoad
                    ? "scale-100 opacity-100 motion-safe:animate-[melissarte-rise_600ms_ease-out]"
                    : "scale-100 opacity-100"
                : subtleEntrance
                  ? "scale-[0.99] opacity-100"
                  : "scale-[1.025] opacity-0",
              "group-hover:scale-[1.02] group-hover:brightness-[1.02]",
            ].join(" ")}
            style={{ animationDelay: `${animationDelay}ms` }}
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