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
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold">
        Portada
      </h2>

      {values.cover_image ? (
        <Image
          src={values.cover_image}
          alt="Portada del evento"
          width={1200}
          height={600}
          className="h-56 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-gray-500">
          Sin portada
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
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