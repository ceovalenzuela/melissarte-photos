"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";

interface UploadButtonProps {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadButton({
  onSelect,
  disabled = false,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    onSelect(files);

    // Permite volver a seleccionar los mismos archivos
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFiles}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label={
          disabled
            ? "Compartiendo fotografías"
            : "Compartir mis fotografías"
        }
        className="
          fixed
          bottom-8
          right-8
          z-50
          flex
          items-center
          gap-3
          rounded-full
          bg-neutral-800
          px-6
          py-3.5
          text-white
          shadow-md
          transition-all
          duration-200
          hover:bg-black
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Camera
          className="h-5 w-5 shrink-0"
          strokeWidth={2.2}
        />

        <span className="whitespace-nowrap text-sm font-medium">
          {disabled ? "Compartiendo..." : "Compartir mis fotos"}
        </span>
      </button>
    </>
  );
}