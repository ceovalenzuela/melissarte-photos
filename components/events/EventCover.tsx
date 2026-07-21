"use client";

import { useState } from "react";
import Image from "next/image";

import { uploadCover, updateEvent } from "@/lib/events";

interface Props {
  eventId: string;
  coverImage: string | null;
  onUploaded: (url: string) => void;
}

export default function EventCover({
  eventId,
  coverImage,
  onUploaded,
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    try {
      setUploading(true);

      const url = await uploadCover(file, eventId);

      await updateEvent(eventId, {
        cover_image: url,
      });

      onUploaded(url);
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

      {coverImage ? (
        <Image
          src={coverImage}
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

      <label className="inline-flex cursor-pointer items-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
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