import { ImageIcon } from "lucide-react";

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
    <section className="py-2">

      <header className="mb-8">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <ImageIcon className="h-5 w-5 text-neutral-700" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Álbum del evento
            </h2>

            <p className="text-sm text-neutral-500">
              {photos.length} fotografías compartidas
            </p>
          </div>

        </div>
      </header>

      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">
          Todavía no hay fotografías.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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