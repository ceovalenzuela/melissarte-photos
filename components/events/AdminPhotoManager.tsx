"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Photo,
  deletePhoto,
  getPhotosByEvent,
} from "@/lib/photos";

interface Props {
  eventId: string;
  refreshKey?: number;
}

export default function AdminPhotoManager({
  eventId,
  refreshKey = 0,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingPhotoId, setDeletingPhotoId] =
    useState<string | null>(null);

  async function loadPhotos() {
    try {
      setLoading(true);

      const result = await getPhotosByEvent(
        eventId,
        0,
        40,
        "newest"
      );

      setPhotos(result.photos);
      setTotalPhotos(result.total);
    } catch (error) {
      console.error(error);
      toast.error(
        "No fue posible cargar las fotografías."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPhotos();
  }, [eventId, refreshKey]);

  async function handleDelete(photo: Photo) {
    const confirmed = confirm(
      "¿Eliminar esta fotografía?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPhotoId(photo.id);

      await deletePhoto(photo);

      setPhotos((current) =>
        current.filter((item) => item.id !== photo.id)
      );

      setTotalPhotos((current) =>
        Math.max(0, current - 1)
      );

      toast.success("Fotografía eliminada.");
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible eliminar la fotografía."
      );
    } finally {
      setDeletingPhotoId(null);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-[#1F1F1F]">
          Fotografías
        </h2>

        <p className="mt-2 text-sm text-[#7D7467]">
          {totalPhotos === 0
            ? "Esta galería no tiene fotografías."
            : `${totalPhotos} ${
                totalPhotos === 1
                  ? "fotografía"
                  : "fotografías"
              } en esta galería.`}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#7D7467]">
          Cargando fotografías...
        </p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-[#7D7467]">
          Esta galería no tiene fotografías.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white"
            >
              <img
                src={photo.thumbnail_url}
                alt={photo.file_name}
                className="aspect-square w-full object-cover"
              />

              <button
                type="button"
                aria-label="Eliminar fotografía"
                onClick={() => handleDelete(photo)}
                disabled={
                  deletingPhotoId === photo.id
                }
                className="
                  absolute
                  right-2
                  top-2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-black/60
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-600
                  disabled:cursor-wait
                  disabled:opacity-60
                  md:opacity-0
                  md:group-hover:opacity-100
                "
              >
                {deletingPhotoId === photo.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPhotos > 40 && (
        <p className="text-xs text-[#7D7467]">
          Mostrando las 40 fotografías más recientes.
        </p>
      )}
    </div>
  );
}