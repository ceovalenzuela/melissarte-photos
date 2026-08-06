"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { uploadCover, updateEvent } from "@/lib/events";
import { Event } from "@/types/event";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface Props {
  values: Event;
  onChange: (values: Event) => void;
}

export default function EventCover({
  values,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

      toast.success("Portada actualizada.");
    } catch (error) {
      console.error(error);
      toast.error(
  "No fue posible actualizar la portada."
);
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
          className="aspect-video w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl border border-dashed border-[#E7DCC8] bg-white text-[#7D7467]">
  Sin portada
</div>
      )}

      <>
  <input
    ref={inputRef}
    type="file"
    accept="image/*"
    className="hidden"
    id="cover-upload"
    disabled={uploading}
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        handleFile(file);
      }
    }}
  />

  <Button
  type="button"
  disabled={uploading}
  onClick={() => inputRef.current?.click()}
  className="
    h-12
    rounded-full
    bg-[#A88249]
    px-7
    text-sm
    font-medium
    text-white
    transition-colors
    duration-200
    hover:bg-[#977640]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {uploading ? (
    "Subiendo..."
  ) : (
    <>
      Cambiar portada
    </>
  )}
</Button>
</>
    </div>
  );
}