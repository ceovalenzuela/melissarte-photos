"use client";

import { Camera, LoaderCircle } from "lucide-react";
import { useRef } from "react";

interface UploadButtonProps {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
  uploading?: boolean;
  completed?: number;
  total?: number;
  floating?: boolean;
}

export default function UploadButton({
  onSelect,
  disabled = false,
  uploading = false,
  completed = 0,
  total = 0,
  floating = false,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isPreparing = uploading && completed === 0;

  const buttonLabel = isPreparing
    ? "Preparando fotografías..."
    : uploading
      ? `Subiendo ${completed} de ${total}`
      : "Subir fotografías";

  const Icon = uploading ? LoaderCircle : Camera;

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
  aria-label={buttonLabel}
  className={`
  inline-flex
  h-12
  items-center
  justify-center
  gap-3
  rounded-full
  bg-[#A88249]
  px-7
  text-sm
  font-medium
  text-white
  shadow-sm
  transition-all
  duration-200
  hover:bg-[#977640]
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-60

  ${
    floating
      ? "fixed bottom-8 right-8 z-50"
      : ""
  }
`}
>

        <Icon
          className={`h-5 w-5 shrink-0 ${
            uploading ? "animate-spin" : ""
          }`}
          strokeWidth={2.2}
        />

        <span className="whitespace-nowrap text-sm font-medium">
          {buttonLabel}
        </span>
      </button>
    </>
  );
}