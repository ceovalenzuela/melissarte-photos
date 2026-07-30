"use client";

import { useEffect, useState } from "react";

import { Event } from "@/types/event";
import { Photo } from "@/types/photo";

import UploadButton from "./UploadButton";
import PublicGallery from "../gallery/PublicGallery";
import PhotoLightbox from "./PhotoLightbox";

import { toast } from "sonner";

import {
  uploadPhotos,
  getPhotosByEvent,
} from "@/lib/photos";

import { subscribeToEventPhotos } from "@/lib/realtime";

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPhotos, setTotalPhotos] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); 

  async function loadPhotos(currentPage = 0, reset = false) {
  try {
    const result = await getPhotosByEvent(
  event.id,
  currentPage
);

const newPhotos = result.photos;

setTotalPhotos(result.total);

    if (reset) {
      setPhotos(newPhotos);
    } else {
      setPhotos((current) => [...current, ...newPhotos]);
    }

    setHasMore(newPhotos.length === 40);
    setPage(currentPage);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadPhotos(0, true);

    const unsubscribe = subscribeToEventPhotos(
  event.id,
  () => loadPhotos(0, true)
);
    return () => {
      unsubscribe();
    };
  }, [event.id]);

  async function handleLoadMore() {
  if (loadingMore) return;

  setLoadingMore(true);

  try {
    await loadPhotos(page + 1);
  } finally {
    setLoadingMore(false);
  }
}

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

      if (result.failed.length === 0) {
        toast.success(
          `${result.success} fotografía${
            result.success !== 1 ? "s" : ""
          } subida${
            result.success !== 1 ? "s" : ""
          } correctamente`
        );
      } else {
        toast.warning(
          `Carga completada. ${result.success} fotografía${
            result.success !== 1 ? "s" : ""
          } subida${
            result.success !== 1 ? "s" : ""
          }. ${result.failed.length} no pudieron subirse.`
        );
      }
    } catch (error) {
      console.error(error);

      toast.error("Ocurrió un error al iniciar la carga.");
    } finally {
      setUploadState({
        uploading: false,
        completed: 0,
        total: 0,
      });
    }
  }

  function handlePhotoClick(index: number) {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }
  return (
    <>
      <UploadButton
        onSelect={handleSelect}
        disabled={uploadState.uploading}
        uploading={uploadState.uploading}
        completed={uploadState.completed}
        total={uploadState.total}
      />

      <PublicGallery
  photos={photos}
  totalPhotos={totalPhotos}
  loading={loading}
  onPhotoClick={handlePhotoClick}
/>

{hasMore && (
  <div className="mt-8 flex justify-center">
    <button
  onClick={handleLoadMore}
  disabled={loadingMore}
  className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loadingMore ? "Cargando..." : "Cargar más fotografías"}
</button>
  </div>
)}

<PhotoLightbox
  open={lightboxOpen}
  index={selectedIndex}
  photos={photos}
  onClose={() => setLightboxOpen(false)}
/>
    </>
  );
}