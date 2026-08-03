"use client";

import { Event } from "@/types/event";
import { useEffect, useState } from "react";
import { Photo } from "@/types/photo";

import { getPhotosByEvent } from "@/lib/photos";
import { subscribeToEventPhotos } from "@/lib/realtime";

import PublicGallery from "./PublicGallery";
import PhotoLightbox from "@/components/public/PhotoLightbox";

interface Props {
  event: Event;
  onTotalPhotosChange?: (
    total: number
  ) => void;
}

export default function GallerySection({
  event,
  onTotalPhotosChange,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [loading, setLoading] = useState(true);

  const [totalPhotos, setTotalPhotos] =
    useState(0);

const [lightboxOpen, setLightboxOpen] =
  useState(false);

const [selectedIndex, setSelectedIndex] =
  useState(0);

  const [page, setPage] = useState(0);

const [hasMore, setHasMore] = useState(true);

const [loadingMore, setLoadingMore] =
  useState(false);

  async function loadPhotos(
  currentPage = 0,
  reset = false
) {
    const result = await getPhotosByEvent(
  event.id,
  currentPage
);

    const newPhotos = result.photos;

if (reset) {
  setPhotos(newPhotos);
} else {
  setPhotos((current) => [
    ...current,
    ...newPhotos,
  ]);
}

setHasMore(newPhotos.length === 40);

setPage(currentPage);

    setTotalPhotos(result.total);

onTotalPhotosChange?.(
  result.total
);

setLoading(false);
  }

  function handlePhotoClick(index: number) {
  window.history.pushState(
    { lightbox: true },
    ""
  );

  setSelectedIndex(index);
  setLightboxOpen(true);
}

async function handleLoadMore() {
  if (loadingMore) return;

  setLoadingMore(true);

  try {
    await loadPhotos(page + 1);
  } finally {
    setLoadingMore(false);
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

  useEffect(() => {
  function handlePopState() {
    setLightboxOpen(false);
  }

  window.addEventListener(
    "popstate",
    handlePopState
  );

  return () => {
    window.removeEventListener(
      "popstate",
      handlePopState
    );
  };
}, []);

  return (
  <>
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
      className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loadingMore
        ? "Cargando..."
        : "Cargar más fotografías"}
    </button>
  </div>
)}

    <PhotoLightbox
      open={lightboxOpen}
      index={selectedIndex}
      photos={photos}
      onClose={() => {
        if (lightboxOpen) {
          window.history.back();
        }
      }}
    />
  </>
);
}