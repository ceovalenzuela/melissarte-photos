"use client";

import { useEffect, useState } from "react";

import { Event } from "@/types/event";
import { Photo } from "@/types/photo";

import UploadCard from "./UploadCard";
import PublicGallery from "./PublicGallery";

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
  const [loading, setLoading] = useState(true);

  async function loadPhotos() {
    const data = await getPhotosByEvent(event.id);
    setPhotos(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPhotos();
  }, []);

  async function handleSelect(files: File[]) {
    try {
      await uploadPhotos(event.id, files);

      await loadPhotos();
    } catch (err) {
      console.error(err);
      alert("Error al subir fotografías");
    }
  }

  return (
    <>
      <UploadCard onSelect={handleSelect} />

      <PublicGallery
        photos={photos}
        loading={loading}
      />
    </>
  );
}