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
          "No se pudo subir ninguna fotografía."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Ocurrió un error. Intenta nuevamente."
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
        welcomeMessage={
          event.welcome_message ?? undefined
        }
      >
        <UploadButton
          onSelect={handleSelect}
          disabled={uploadState.uploading}
          uploading={uploadState.uploading}
          completed={uploadState.completed}
          total={uploadState.total}
        />
      </EventSummaryCard>

      <GallerySection event={event} />
    </>
  );
}