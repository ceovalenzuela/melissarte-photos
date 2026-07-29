"use client";

import { useEffect, useState } from "react";

import { Event } from "@/types/event";
import { Photo } from "@/types/photo";

import UploadButton from "./UploadButton";
import PublicGallery from "../gallery/PublicGallery";
import PhotoLightbox from "./PhotoLightbox";
import InfiniteScrollTrigger from "@/components/ui/InfiniteScrollTrigger";

import { toast } from "sonner";

import {
  uploadPhotos,
  getPhotosByEvent,
} from "@/lib/photos";

import { subscribeToEventPhotos } from "@/lib/realtime";

interface PublicEventClientProps {
  event: Event;
}

const INITIAL_BATCH_SIZE = 30;
const BATCH_SIZE = 30;

export default function PublicEventClient({
  event,
}: PublicEventClientProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadState, setUploadState] = useState({
  uploading: false,
  completed: 0,
  total: 0,
});
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [visibleCount, setVisibleCount] = useState(
    INITIAL_BATCH_SIZE
  );

  const visiblePhotos = photos.slice(0, visibleCount);

  async function loadPhotos() {
    try {
      const data = await getPhotosByEvent(event.id);

      setPhotos(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPhotos();

    const unsubscribe = subscribeToEventPhotos(
      event.id,
      loadPhotos
    );

    return () => {
      unsubscribe();
    };
  }, [event.id]);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [event.id]);

  async function handleSelect(files: File[]) {
  try {
    setUploadState({
      uploading: true,
      completed: 0,
      total: files.length,
    });

    await uploadPhotos(
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

    toast.success(
      `${files.length} fotografía${
        files.length > 1 ? "s" : ""
      } subida${files.length > 1 ? "s" : ""} correctamente`
    );
  } catch (err) {
    console.error(err);

    toast.error("Error al subir las fotografías");
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

  function loadMorePhotos() {
    setVisibleCount((current) =>
      Math.min(current + BATCH_SIZE, photos.length)
    );
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
  photos={visiblePhotos}
  loading={loading}
  onPhotoClick={handlePhotoClick}
/>

{visibleCount < photos.length && (
  <InfiniteScrollTrigger
    onLoadMore={loadMorePhotos}
  />
)}

      <PhotoLightbox
        open={lightboxOpen}
        index={selectedIndex}
        photos={visiblePhotos}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}