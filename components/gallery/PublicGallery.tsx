import { Photo } from "@/types/photo";

import GalleryImage from "./GalleryImage";
import GallerySkeleton from "./GallerySkeleton";

interface Props {
  photos: Photo[];
  loading: boolean;
  onPhotoClick: (index: number) => void;
}

export default function PublicGallery({
  photos,
  loading,
  onPhotoClick,
}: Props) {
  return (
    <section>
      <header className="mb-8">
        <div className="mx-auto mb-5 h-px w-24 bg-neutral-200" />

        <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
          Álbum
        </p>

        <p className="mt-2 text-center text-base text-neutral-700">
          {photos.length} fotografía
          {photos.length !== 1 ? "s" : ""} compartida
          {photos.length !== 1 ? "s" : ""}
        </p>
      </header>

      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 py-12 text-center text-neutral-500">
          Todavía no hay fotografías.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
          {photos.map((photo, index) => (
            <GalleryImage
              key={photo.id}
              src={photo.public_url}
              alt={`Fotografía ${index + 1}`}
              priority={index < 6}
              onClick={() => onPhotoClick(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}