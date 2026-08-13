import { Photo } from "@/types/photo";
import { Trash2 } from "lucide-react";

import GalleryImage from "./GalleryImage";
import GallerySkeleton from "./GallerySkeleton";

interface Props {
  photos: Photo[];
  totalPhotos: number;
  loading: boolean;
  onPhotoClick: (index: number) => void;
  canDeletePhotos?: boolean;
  deletingPhotoId?: string | null;
  onDeletePhoto?: (photo: Photo) => void;
}

export default function PublicGallery({
  photos,
  totalPhotos,
  loading,
  onPhotoClick,
  canDeletePhotos = false,
  deletingPhotoId = null,
  onDeletePhoto,
}: Props) {
  return (
    <section className="mt-2">

      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 py-12 text-center text-neutral-500">
          Todavía no hay fotografías.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative"
            >
              <GalleryImage
                src={photo.thumbnail_url}
                alt={`Fotografía ${index + 1}`}
                priority={index < 6}
                onClick={() => onPhotoClick(index)}
              />

              {canDeletePhotos && onDeletePhoto && (
                <button
                  type="button"
                  aria-label={`Eliminar fotografía ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeletePhoto(photo);
                  }}
                  disabled={deletingPhotoId === photo.id}
                  className="
                    absolute
                    right-2
                    top-2
                    z-10
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-black/55
                    text-white
                    backdrop-blur-sm
                    transition
                    hover:bg-red-600/90
                    disabled:cursor-wait
                    disabled:opacity-60
                    md:opacity-0
                    md:group-hover:opacity-100
                  "
                >
                  {deletingPhotoId === photo.id ? (
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                      "
                    />
                  ) : (
                    <Trash2 size={16} strokeWidth={2} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}