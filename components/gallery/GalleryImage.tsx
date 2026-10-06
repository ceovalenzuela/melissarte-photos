"use client";

import { memo, useState } from "react";

interface Props {
  src: string;
  alt: string;
  priority?: boolean;
  onClick: () => void;
  featured?: boolean;
  onOrientationChange?: (orientation: "portrait" | "square" | "landscape") => void;
}

function GalleryImage({
  src,
  alt,
  priority = false,
  onClick,
  featured = false,
  onOrientationChange,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageRatio, setImageRatio] =
    useState<"portrait" | "square" | "landscape">("square");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
        className={[
          "group",
          "relative",
          "overflow-hidden",
          "rounded-[1.15rem]",
          imageRatio === "portrait"
            ? "aspect-[4/5]"
            : imageRatio === "landscape"
              ? "aspect-[3/2]"
              : "aspect-square",
          "bg-neutral-100",
          "transition-transform",
          "duration-200",
          "active:scale-[0.985]",
          "shadow-[0_8px_28px_rgba(53,44,34,0.06)]",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-neutral-300",
          "focus:ring-offset-2",
        ].join(" ")}
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
              "relative z-10 h-full w-full object-cover",
              imageRatio === "portrait"
                ? "[object-position:center_35%]"
                : "object-center",
              "transition-all duration-700 ease-out",
              loaded
                ? "scale-100 opacity-100 motion-safe:animate-[melissarte-rise_600ms_ease-out]"
                : "scale-[1.025] opacity-0",
              "group-hover:scale-[1.025] group-hover:brightness-[1.02]",
            ].join(" ")}
            onLoad={(event) => {
              const image = event.currentTarget;
              const ratio =
                image.naturalWidth / image.naturalHeight;

              const orientation =
                ratio < 0.82
                  ? "portrait"
                  : ratio > 1.18
                    ? "landscape"
                    : "square";

              setImageRatio(orientation);
              onOrientationChange?.(orientation);
              setLoaded(true);
            }}
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