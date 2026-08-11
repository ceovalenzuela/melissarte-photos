import { Photo } from "@/types/photo";

import GalleryImage from "./GalleryImage";
import GallerySkeleton from "./GallerySkeleton";

interface Props {
  photos: Photo[];
  totalPhotos: number;
  loading: boolean;
  onPhotoClick: (index: number) => void;
}

export default function PublicGallery({
  photos,
  totalPhotos,
  loading,
  onPhotoClick,
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
            <GalleryImage
  key={photo.id}
  src={photo.thumbnail_url}
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