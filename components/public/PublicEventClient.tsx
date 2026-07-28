"use client";

import { useEffect, useState } from "react";

import { Event } from "@/types/event";
import { Photo } from "@/types/photo";

import UploadCard from "./UploadCard";
import PublicGallery from "./PublicGallery";
import PhotoLightbox from "./PhotoLightbox";

import { toast } from "sonner";

import {
  uploadPhotos,
  getPhotosByEvent,
} from "@/lib/photos";

interface PublicEventClientProps {
  event: Event;
}

export default function PublicEventClient({
  event,
}: PublicEventClientProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  async function loadPhotos() {
    setLoading(true);

    try {
      const data = await getPhotosByEvent(event.id);
      setPhotos(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPhotos();
  }, []);

  async function handleSelect(files: File[]) {
    try {
      setUploading(true);

      await uploadPhotos(event.id, files);

      await loadPhotos();

      toast.success(
        `${files.length} fotografía${
          files.length > 1 ? "s" : ""
        } subida${files.length > 1 ? "s" : ""} correctamente`
      );
    } catch (err) {
      console.error(err);

      toast.error("Error al subir las fotografías");
    } finally {
      setUploading(false);
    }
  }

  function handlePhotoClick(index: number) {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <UploadCard
        onSelect={handleSelect}
        disabled={uploading}
      />

      <PublicGallery
        photos={photos}
        loading={loading}
        onPhotoClick={handlePhotoClick}
      />

      <PhotoLightbox
        open={lightboxOpen}
        index={selectedIndex}
        photos={photos}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}