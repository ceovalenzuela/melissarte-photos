"use client";

import { Upload } from "lucide-react";
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
        className="
          group
          fixed
          bottom-6
          right-6
          z-50
          flex
          h-16
          items-center
          justify-center
          rounded-full
          bg-black
          px-5
          text-white
          shadow-xl
          transition-all
          duration-300
          hover:bg-neutral-900
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Upload className="h-6 w-6 shrink-0" />

        <span
          className="
            ml-0
            max-w-0
            overflow-hidden
            whitespace-nowrap
            opacity-0
            transition-all
            duration-300
            group-hover:ml-3
            group-hover:max-w-[180px]
            group-hover:opacity-100
          "
        >
          {disabled ? "Subiendo..." : "Subir fotografías"}
        </span>
      </button>
    </>
  );
}