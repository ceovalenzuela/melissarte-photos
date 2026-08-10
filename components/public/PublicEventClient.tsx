"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Event } from "@/types/event";

import UploadButton from "./UploadButton";
import EventSummaryCard from "@/components/events/EventSummaryCard";
import GallerySection from "@/components/gallery/GallerySection";

import { uploadPhotos } from "@/lib/photos";

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
  const [uploadState, setUploadState] =
    useState<UploadState>({
      uploading: false,
      completed: 0,
      total: 0,
    });

  const router = useRouter();

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
          `${result.success} fotografía${successPlural} subida${successPlural}.`
        );

        if (navigator.onLine) {
  router.refresh();
}
      } else if (result.success > 0) {
        toast.warning(
          `${result.success} de ${result.total} fotografía${totalPlural} subida${successPlural}.\nReintenta las ${result.failed.length} restantes.`
        );

        if (navigator.onLine) {
          startTransition(() => {
            router.refresh();
          });
        }
      } else {
        toast.error(
          "Ocurrió un error. Revisa tu conexión e intenta nuevamente."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo subir ninguna fotografía. Intenta Nuevamente."
      );
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
  <div className="flex flex-col items-center">
    <UploadButton
      onSelect={handleSelect}
      disabled={
        event.status !== "published" ||
        uploadState.uploading
      }
      uploading={uploadState.uploading}
      completed={uploadState.completed}
      total={uploadState.total}
    />

    {event.status !== "published" && (
      <p className="mt-2 text-center text-xs text-[#7D7467]">
        Esta galería aún no está activa.
      </p>
    )}
  </div>
</EventSummaryCard>

      <GallerySection event={event} />
    </>
  );
}