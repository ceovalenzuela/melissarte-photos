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
      <header className="mb-4 px-1">
        <h2 className="text-base font-medium tracking-tight text-neutral-900">
          Álbum
        </h2>

        <p className="mt-0.5 text-sm text-neutral-500">
          {photos.length} foto{photos.length !== 1 ? "s" : ""}
        </p>
      </header>

      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="py-12 text-center text-neutral-500">
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