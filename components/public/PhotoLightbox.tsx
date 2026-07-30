"use client";

import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";

import "yet-another-react-lightbox/styles.css";

import { Photo } from "@/types/photo";

interface PhotoLightboxProps {
  open: boolean;
  index: number;
  photos: Photo[];
  onClose: () => void;
}

export default function PhotoLightbox({
  open,
  index,
  photos,
  onClose,
}: PhotoLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      plugins={[Download]}
      slides={photos.map((photo) => ({
        src: photo.public_url,
        download: {
          url: photo.public_url,
          filename: photo.file_name,
        },
      }))}
    />
  );
}