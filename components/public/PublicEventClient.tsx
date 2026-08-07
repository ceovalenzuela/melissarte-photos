"use client";

import { useState } from "react";

import { Event } from "@/types/event";

import UploadButton from "./UploadButton";

import { toast } from "sonner";

import { uploadPhotos } from "@/lib/photos";

import GallerySection from "@/components/gallery/GallerySection";

import EventSummaryCard from "@/components/events/EventSummaryCard";

import { useRouter } from "next/navigation";

interface PublicEventClientProps {
  event: Event;
}

interface UploadState {
  uploading: boolean;
  completed: number;
  total: number;
}

export default function PublicEventClient({
  event,
}: PublicEventClientProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    completed: 0,
    total: 0,
  });
  
  const router = useRouter();
  const [totalPhotos, setTotalPhotos] =
  useState(0);

  async function handleSelect(files: File[]) {
    setUploadState({
      uploading: true,
      completed: 0,
      total: files.length,
    });

    try {
      const result = await uploadPhotos(
        event.id,
        files,
        ({ completed, total }) => {
          setUploadState({
            uploading: true,
            completed,
            total,
          });
        }
      );

const successPlural =
  result.success !== 1 ? "s" : "";

const totalPlural =
  result.total !== 1 ? "s" : "";

      if (result.success === result.total) {
  toast.success(
    `${result.success} fotografía${
      result.success !== 1 ? "s" : ""
    } subida${
      result.success !== 1 ? "s" : ""
    }.`
  );

  router.refresh();

} else if (result.success > 0) {
  toast.warning(
    `${result.success} de ${result.total} fotografía${
      result.total !== 1 ? "s" : ""
    } subida${
      result.success !== 1 ? "s" : ""
    }.\nReintenta las ${result.failed.length} restantes.`
  );

  router.refresh();

} else {
  toast.error(
    "Ocurrió un error. Revisa tu conexión e intenta nuevamente."
  );
}
    } catch (error) {
      console.error(error);

      toast.error("No fue posible subir las fotografías. Intenta nuevamente");
    } finally {
      setUploadState({
        uploading: false,
        completed: 0,
        total: 0,
      });
    }
  }

  return (
    <>
  <EventSummaryCard
  welcomeMessage={event.welcome_message ?? undefined}
>
  <UploadButton
    onSelect={handleSelect}
    disabled={uploadState.uploading}
    uploading={uploadState.uploading}
    completed={uploadState.completed}
    total={uploadState.total}
  />
</EventSummaryCard>

  <GallerySection
  event={event}
  onTotalPhotosChange={setTotalPhotos}
/>
</>
  );
}