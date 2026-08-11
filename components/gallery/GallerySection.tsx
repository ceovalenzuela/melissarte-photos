"use client";

import { Event } from "@/types/event";
import { useEffect, useState } from "react";
import { Photo } from "@/types/photo";

import {
  getPhotosByEvent,
  PhotoSortOrder,
} from "@/lib/photos";
import { subscribeToEventPhotos } from "@/lib/realtime";

import PublicGallery from "./PublicGallery";
import PhotoLightbox from "@/components/public/PhotoLightbox";
import {
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

  const [sortOrder, setSortOrder] =
    useState<PhotoSortOrder>("newest");

  const [sortMenuOpen, setSortMenuOpen] =
    useState(false);

  async function loadPhotos(
    currentPage = 0,
    reset = false,
    order: PhotoSortOrder = sortOrder
  ) {
    try {
      setError(false);

      const result = await getPhotosByEvent(
        event.id,
        currentPage,
        40,
        order
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
      await loadPhotos(
        page + 1,
        false,
        sortOrder
      );
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSortChange(
    order: PhotoSortOrder
  ) {
    if (order === sortOrder) {
      setSortMenuOpen(false);
      return;
    }

    setSortOrder(order);
    setSortMenuOpen(false);

    setLoading(true);
    setPage(0);
    setHasMore(true);
    setPhotos([]);

    await loadPhotos(
      0,
      true,
      order
    );
  }

  useEffect(() => {
    loadPhotos(0, true, sortOrder);

    const unsubscribe =
      subscribeToEventPhotos(
        event.id,
        () => loadPhotos(
          0,
          true,
          sortOrder
        )
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
  <div className="mb-2 flex justify-end">
  <div className="relative">
    <button
      type="button"
      onClick={() =>
        setSortMenuOpen((open) => !open)
      }
      className="
        group
        inline-flex
        items-center
        gap-1.5
        border-b
        border-[#D9CBB3]
        pb-1
        text-sm
        font-medium
        text-[#6F665B]
        transition-colors
        duration-200
        hover:text-[#3F3A34]
        focus:outline-none
      "
      aria-expanded={sortMenuOpen}
      aria-haspopup="menu"
    >
      {sortOrder === "newest"
        ? "Más recientes"
        : "Más antiguas"}

      <ChevronDown
        size={14}
        strokeWidth={1.8}
        className={`
          transition-transform
          duration-200
          ${
            sortMenuOpen
              ? "rotate-180"
              : ""
          }
        `}
      />
    </button>

    {sortMenuOpen && (
      <div
        className="
          absolute
          right-0
          z-30
          mt-2
          w-40
          overflow-hidden
          rounded-xl
          border
          border-[#E7DCC8]
          bg-[#FDFBF8]
          p-1
          shadow-md
        "
        role="menu"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() =>
            handleSortChange("newest")
          }
          className={`
            w-full
            rounded-lg
            px-3
            py-2
            text-left
            text-sm
            transition-colors
            ${
              sortOrder === "newest"
                ? "bg-[#F3ECE2] font-medium text-[#1F1F1F]"
                : "text-[#6F665B] hover:bg-[#F8F4EE]"
            }
          `}
        >
          Más recientes
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            handleSortChange("oldest")
          }
          className={`
            w-full
            rounded-lg
            px-3
            py-2
            text-left
            text-sm
            transition-colors
            ${
              sortOrder === "oldest"
                ? "bg-[#F3ECE2] font-medium text-[#1F1F1F]"
                : "text-[#6F665B] hover:bg-[#F8F4EE]"
            }
          `}
        >
          Más antiguas
        </button>
      </div>
    )}
  </div>
</div>

      <PublicGallery
        photos={photos}
        totalPhotos={totalPhotos}
        loading={loading}
        onPhotoClick={handlePhotoClick}
      />

      {hasMore && (
  <div className="mt-8 flex justify-center">
    <button
      type="button"
      onClick={handleLoadMore}
      disabled={loadingMore}
      className="
        group
        inline-flex
        items-center
        gap-1.5
        border-b
        border-[#D9CBB3]
        pb-1
        text-sm
        font-medium
        text-[#6F665B]
        transition-all
        duration-200
        hover:border-[#BFAE91]
        hover:text-[#3F3A34]
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {loadingMore ? (
        "Cargando..."
      ) : (
        <>
          <span>Ver más fotografías</span>

          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="
              transition-transform
              duration-200
              group-hover:translate-y-0.5
            "
          />
        </>
      )}
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