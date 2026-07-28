import { ImageIcon } from "lucide-react";

import { Photo } from "@/types/photo";

interface Props {
  photos: Photo[];
  loading: boolean;
}

export default function PublicGallery({
  photos,
  loading,
}: Props) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
          <ImageIcon className="h-5 w-5 text-neutral-700" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Álbum del evento
          </h2>

          <p className="text-sm text-neutral-500">
            {photos.length} fotografías
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-neutral-500">
            Todavía no hay fotografías.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.public_url}
              alt=""
              className="aspect-square rounded-2xl object-cover"
            />
          ))}
        </div>
      )}
    </section>
  );
}