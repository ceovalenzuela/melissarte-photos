"use client";

import { useState } from "react";
import Image from "next/image";

import { uploadCover, updateEvent } from "@/lib/events";
import { Event } from "@/types/event";

interface Props {
  values: Event;
  onChange: (values: Event) => void;
}

export default function EventCover({
  values,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    try {
      setUploading(true);

      const url = await uploadCover(file, values.id);

      await updateEvent(values.id, {
        cover_image: url,
      });

      onChange({
        ...values,
        cover_image: url,
      });

      alert("Portada actualizada");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al subir la portada.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1F1F1F]">
        Portada
      </h2>

<p className="mt-2 text-sm text-[#7D7467]">
  Esta imagen será la portada principal de la galería.
</p>

      {values.cover_image ? (
        <Image
          src={values.cover_image}
          alt="Portada del evento"
          width={1200}
          height={600}
          className="aspect-[16/9] w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl border border-dashed border-[#E7DCC8] bg-white text-[#7D7467]">
  Sin portada
</div>
      )}

      <label className="
  inline-flex
  h-12
  cursor-pointer
  items-center
  justify-center
  rounded-full
  bg-neutral-800
  px-7
  text-sm
  font-medium
  text-white
  transition-colors
  duration-200
  hover:bg-black
">
        {uploading ? "Subiendo..." : "Cambiar portada"}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleFile(file);
            }
          }}
        />
      </label>
    </div>
  );
}