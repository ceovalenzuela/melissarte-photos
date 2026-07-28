"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

interface UploadCardProps {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadCard({
  onSelect,
  disabled = false,
}: UploadCardProps) {
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
        className="group w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 transition-all group-hover:bg-black">
          <Upload
            size={28}
            className="text-neutral-700 group-hover:text-white"
          />
        </div>

        <h2 className="text-xl font-semibold">
          Compartir fotografías
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
          Comparte tus mejores recuerdos con todos los invitados.
        </p>

        <div className="mt-8 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white">
          Seleccionar fotografías
        </div>
      </button>
    </>
  );
}