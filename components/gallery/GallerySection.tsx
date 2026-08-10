"use client";

import { Event } from "@/types/event";
import { useEffect, useState } from "react";
import { Photo } from "@/types/photo";

import { getPhotosByEvent } from "@/lib/photos";
import { subscribeToEventPhotos } from "@/lib/realtime";

import PublicGallery from "./PublicGallery";
import PhotoLightbox from "@/components/public/PhotoLightbox";
import {
  Camera,
  ChevronDown,
} from "lucide-react";

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

  const [error, setError] = useState(false);

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
  try {
    setError(false);

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

  } catch (error) {
    console.error(error);

    setError(true);
  } finally {
    setLoading(false);
  }
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

if (error) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-semibold text-[#1F1F1F]">
        No fue posible cargar las fotografías
      </h2>

      <p className="mt-3 text-[#7D7467]">
        Intenta nuevamente en unos momentos.
      </p>
    </div>
  );
}

if (!loading && photos.length === 0) {
  return (
    <div className="py-10 text-center">
      <h2 className="text-xl font-semibold text-[#1F1F1F]">
        Aún no hay fotografías
      </h2>

      <p className="mt-3 text-[#7D7467]">
        Las fotografías compartidas durante el evento aparecerán aquí.
      </p>
    </div>
  );
}

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
  className="
  group
  inline-flex
  h-12
  items-center
  justify-center
  rounded-full
  border
  border-[#E7DCC8]
  bg-[#FDFBF8]
  px-7
  text-sm
  font-medium
  text-[#1F1F1F]
  shadow-sm
  transition-all
  duration-200
  hover:bg-[#FCF8F3]
  hover:border-[#D9CBB3]
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-60
"
>
  <>
  {!loadingMore && (
    <ChevronDown
  size={18}
  strokeWidth={2.3}
  className="mr-2 transition-transform duration-200 group-hover:translate-y-0.5"
/>
  )}

  {loadingMore
    ? "Cargando..."
    : "Ver más fotografías"}
</>
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