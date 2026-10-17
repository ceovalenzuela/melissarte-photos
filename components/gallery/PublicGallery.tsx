import { useState } from "react";
import { Photo } from "@/types/photo";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import GalleryImage from "./GalleryImage";
import GallerySkeleton from "./GallerySkeleton";

interface Props {
  photos: Photo[];
  totalPhotos: number;
  loading: boolean;
  onPhotoClick: (index: number) => void;
  animatePhotos?: boolean;
  newlyAddedPhotoIds?: string[];
  canDeletePhotos?: boolean;
  deletingPhotoId?: string | null;
  onDeletePhoto?: (photo: Photo) => void;
}

export default function PublicGallery({
  photos,
  totalPhotos,
  loading,
  onPhotoClick,
  animatePhotos = true,
  newlyAddedPhotoIds = [],
  canDeletePhotos = false,
  deletingPhotoId = null,
  onDeletePhoto,
}: Props) {
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(null);

  async function handleDownload(photo: Photo) {
    if (downloadingPhotoId) return;

    try {
      setDownloadingPhotoId(photo.id);
      const response = await fetch(photo.public_url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = photo.file_name || `fotografia-${photo.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("No fue posible descargar la fotografía:", error);
      toast.error("No fue posible descargar la fotografía.");
    } finally {
      setDownloadingPhotoId(null);
    }
  }

  return (
    <section className="mt-2">
      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 py-12 text-center text-neutral-500">
          Todavía no hay fotografías.
        </div>
      ) : (
        <div className="columns-2 gap-2.5 md:columns-3 md:gap-3.5 xl:columns-4 xl:gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative break-inside-avoid">
              <GalleryImage
                src={photo.thumbnail_url}
                alt={`Fotografía ${index + 1}`}
                priority={index < 6}
                animateOnLoad={animatePhotos}
                subtleEntrance={newlyAddedPhotoIds.includes(photo.id)}
                onClick={() => onPhotoClick(index)}
              />

              {canDeletePhotos && (
                <>
                  <button
                    type="button"
                    aria-label={`Descargar fotografía ${index + 1}`}
                    title="Descargar fotografía"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDownload(photo);
                    }}
                    disabled={downloadingPhotoId === photo.id}
                    className="absolute right-12 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm transition hover:bg-[#8E6D3D] disabled:cursor-wait disabled:opacity-60"
                  >
                    {downloadingPhotoId === photo.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Download size={16} strokeWidth={2} />
                    )}
                  </button>

                  {onDeletePhoto && (
                    <button
                      type="button"
                      aria-label={`Eliminar fotografía ${index + 1}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeletePhoto(photo);
                      }}
                      disabled={deletingPhotoId === photo.id}
                      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-red-600/90 disabled:cursor-wait disabled:opacity-60"
                    >
                      {deletingPhotoId === photo.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <Trash2 size={16} strokeWidth={2} />
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}