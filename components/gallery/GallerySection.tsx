"use client";

import { Event } from "@/types/event";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/types/photo";
import QRCode from "qrcode";

import {
  getPhotosByEvent,
  getAllPhotosByEvent,
  PhotoSortOrder,
} from "@/lib/photos";
import { subscribeToEventPhotos } from "@/lib/realtime";

import PublicGallery from "./PublicGallery";
import PhotoLightbox from "@/components/public/PhotoLightbox";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
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

  const [presentationOpen, setPresentationOpen] =
    useState(false);

  const [presentationPhotos, setPresentationPhotos] =
    useState<Photo[]>([]);

  const [presentationIndex, setPresentationIndex] =
    useState(0);

  const [presentationPlaying, setPresentationPlaying] =
    useState(true);

  const [qrDataUrl, setQrDataUrl] = useState("");

  const presentationOpenRef = useRef(false);

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

  async function handleOpenPresentation() {
    try {
      const allPhotos = await getAllPhotosByEvent(
        event.id
      );

      if (allPhotos.length === 0) return;

      const presentationOrder = [...allPhotos].reverse();

      setPresentationPhotos(presentationOrder);
      setPresentationIndex(0);
      setPresentationPlaying(true);
      presentationOpenRef.current = true;
      setPresentationOpen(true);
    } catch (error) {
      console.error(error);
    }
  }

  function handleClosePresentation() {
    presentationOpenRef.current = false;
    setPresentationOpen(false);
    setPresentationPlaying(false);
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
        async () => {
          await loadPhotos(
            0,
            true,
            sortOrder
          );

          if (presentationOpenRef.current) {
            try {
              const allPhotos =
                await getAllPhotosByEvent(
                  event.id
                );

              const presentationOrder = [
                ...allPhotos,
              ].reverse();

              setPresentationPhotos(
                (currentPhotos) => {
                  const currentNewestId =
                    currentPhotos[0]?.id;

                  const newNewestId =
                    presentationOrder[0]?.id;

                  if (
                    currentNewestId !== newNewestId
                  ) {
                    setPresentationIndex(0);
                  }

                  return presentationOrder;
                }
              );
            } catch (error) {
              console.error(error);
            }
          }
        }
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

  useEffect(() => {
    if (!presentationOpen) {
      setQrDataUrl("");
      return;
    }

    const galleryUrl = window.location.href.split("#")[0];

    QRCode.toDataURL(galleryUrl, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((error) => {
        console.error("No fue posible generar el código QR:", error);
        setQrDataUrl("");
      });
  }, [presentationOpen]);

  useEffect(() => {
    if (!presentationOpen) return;

    let checking = false;

    const checkForNewPhotos = async () => {
      if (checking) return;

      checking = true;

      try {
        const allPhotos = await getAllPhotosByEvent(event.id);
        const presentationOrder = [...allPhotos].reverse();

        setPresentationPhotos((currentPhotos) => {
          const currentNewestId =
            currentPhotos[0]?.id;

          const newNewestId =
            presentationOrder[0]?.id;

          if (currentNewestId === newNewestId) {
            return currentPhotos;
          }

          // A new photo is now the first item because
          // the presentation is ordered newest → oldest.
          setPresentationIndex(0);

          return presentationOrder;
        });
      } catch (error) {
        console.error(
          "No fue posible actualizar la presentación en vivo:",
          error
        );
      } finally {
        checking = false;
      }
    };

    // Check shortly after opening, then every 5 seconds.
    checkForNewPhotos();

    const liveTimer = window.setInterval(
      checkForNewPhotos,
      5000
    );

    return () => {
      window.clearInterval(liveTimer);
    };
  }, [presentationOpen, event.id]);

  useEffect(() => {
    if (!presentationOpen || !presentationPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setPresentationIndex((current) =>
        presentationPhotos.length > 0
          ? (current + 1) % presentationPhotos.length
          : 0
      );
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    presentationOpen,
    presentationPlaying,
    presentationPhotos.length,
  ]);

  useEffect(() => {
    if (!presentationOpen || presentationPhotos.length === 0) {
      return;
    }

    setPresentationIndex((current) =>
      Math.min(current, presentationPhotos.length - 1)
    );
  }, [presentationOpen, presentationPhotos.length]);

  useEffect(() => {
    if (!presentationOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClosePresentation();
        return;
      }

      if (event.key === "ArrowRight") {
        setPresentationIndex((current) =>
          presentationPhotos.length > 0
            ? (current + 1) % presentationPhotos.length
            : 0
        );
      }

      if (event.key === "ArrowLeft") {
        setPresentationIndex((current) =>
          presentationPhotos.length > 0
            ? (current - 1 + presentationPhotos.length) %
              presentationPhotos.length
            : 0
        );
      }

      if (event.key === " ") {
        event.preventDefault();
        setPresentationPlaying((playing) => !playing);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [presentationOpen, presentationPhotos.length]);

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
      <div className="-mt-3">
        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleOpenPresentation}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-[#CDB58F]
              bg-[#CDB58F]
              px-3.5
              py-1.5
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-colors
              duration-200
              hover:bg-[#BFA57B]
              hover:border-[#BFA57B]
              focus:outline-none
            "
          >
            <Play size={13} strokeWidth={2} />
            Presentación en vivo
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setSortMenuOpen(
                  (open) => !open
                )
              }
              className="
                group
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-[#D9CBB3]
                bg-transparent
                px-3
                py-1.5
                text-sm
                font-medium
                text-[#6F665B]
                transition-colors
                duration-200
                hover:bg-[#F8F4EE]
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
                    handleSortChange(
                      "newest"
                    )
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
                    handleSortChange(
                      "oldest"
                    )
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
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#D9CBB3]
                bg-transparent
                px-4
                py-2
                text-sm
                font-medium
                text-[#5F574D]
                transition-all
                duration-200
                hover:bg-[#F8F4EE]
                hover:text-[#3F3A34]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="
                      h-3.5
                      w-3.5
                      animate-spin
                      rounded-full
                      border
                      border-[#D9CBB3]
                      border-t-[#6F665B]
                    "
                  />

                  Cargando...
                </span>
              ) : (
                <>
                  <span>
                    Ver más fotografías
                  </span>

                  <ChevronDown
                    size={16}
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

        {presentationOpen && presentationPhotos.length > 0 && (
          <div className="fixed inset-0 z-[100] flex h-[100dvh] w-full items-center justify-center bg-[#111111]">
            <img
              src={presentationPhotos[presentationIndex].public_url}
              alt={presentationPhotos[presentationIndex].file_name}
              className="h-full w-full object-contain"
            />

            {qrDataUrl && (
              <div className="absolute bottom-20 right-4 z-20 flex flex-col items-center rounded-2xl bg-black/45 p-2.5 text-center backdrop-blur-sm sm:bottom-7 sm:right-7">
                <img
                  src={qrDataUrl}
                  alt="Código QR para compartir fotografías"
                  className="block h-20 w-20 rounded-lg bg-white p-1 sm:h-24 sm:w-24"
                />
                <p className="mt-2 w-full text-center text-[10px] font-medium leading-tight text-white">
                  Escanea para compartir tus fotos
                </p>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-5 pt-12">
              <button
                type="button"
                onClick={() =>
                  setPresentationIndex((current) =>
                    (current - 1 + presentationPhotos.length) %
                    presentationPhotos.length
                  )
                }
                aria-label="Fotografía anterior"
                className="rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setPresentationPlaying((playing) => !playing)
                }
                aria-label={
                  presentationPlaying
                    ? "Pausar presentación"
                    : "Continuar presentación"
                }
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                {presentationPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPresentationIndex((current) =>
                    (current + 1) % presentationPhotos.length
                  )
                }
                aria-label="Siguiente fotografía"
                className="rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <ChevronRight size={22} />
              </button>

              <button
                type="button"
                onClick={handleClosePresentation}
                aria-label="Cerrar presentación"
                className="ml-2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <X size={20} />
              </button>
            </div>

            <div className="absolute left-5 top-5 z-20 sm:left-7 sm:top-6">
              <img
                src="/me-logo.png"
                alt="MelissArte Photos"
                className="h-auto w-[96px] opacity-80 sm:w-[112px]"
              />
            </div>

            <div className="absolute bottom-24 left-5 z-20 max-w-[55vw] sm:bottom-8 sm:left-8">
              <h2 className="text-xl font-medium tracking-wide text-white/80 drop-shadow-lg sm:text-2xl md:text-3xl">
                {event.title}
              </h2>
            </div>

            <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
              {presentationIndex + 1} / {presentationPhotos.length}
            </div>
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
      </div>
    </>
  );
}