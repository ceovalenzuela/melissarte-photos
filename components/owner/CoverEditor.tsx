"use client";

import Cropper, { Area, Point } from "react-easy-crop";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { getCroppedImage } from "@/lib/crop";

interface Props {
  image: string | null;

  onSave?: (
    file: File
  ) => Promise<void>;
}

export default function CoverEditor({
  image,
  onSave,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(image);

const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

const [crop, setCrop] =
  useState<Point>({
    x: 0,
    y: 0,
  });

const [zoom, setZoom] =
  useState(1);

const [croppedAreaPixels, setCroppedAreaPixels] =
  useState<Area>();

useEffect(() => {
  setSelectedImage(image);
}, [image]);

useEffect(() => {
  return () => {
    if (selectedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImage);
    }
  };
}, [selectedImage]);

  function handleSelectFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (selectedImage?.startsWith("blob:")) {
  URL.revokeObjectURL(selectedImage);
}

const url = URL.createObjectURL(file);

setSelectedFile(file);
setSelectedImage(url);
  }

  async function handleSave() {
  if (
    !selectedImage ||
    !croppedAreaPixels
  ) {
    return;
  }

  const file =
    await getCroppedImage(
      selectedImage,
      croppedAreaPixels,
      selectedFile?.name ??
        "cover.jpg"
    );

  await onSave?.(file);
}

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectFile}
      />

      {!selectedImage ? (
        <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-[#E7DCC8] bg-white">
          <div className="text-center">
            <p className="text-lg font-medium text-[#1F1F1F]">
              Aún no has seleccionado una imagen
            </p>

            <p className="mt-2 text-sm text-[#7D7467]">
              Elige una fotografía para la portada.
            </p>

            <button
              onClick={() =>
                inputRef.current?.click()
              }
              className="
                mt-6
                rounded-full
                bg-neutral-800
                px-6
                py-3
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-black
              "
            >
              Seleccionar imagen
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
  className="
    relative
    h-[520px]
    overflow-hidden
    rounded-2xl
    bg-[#1F1F1F]
  "
>
            <Cropper
  image={selectedImage}
  crop={crop}
  zoom={zoom}
  aspect={16 / 9}
  objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(
                _,
                croppedPixels
              ) =>
                setCroppedAreaPixels(
                  croppedPixels
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5C554B]">
              Zoom
            </label>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) =>
                setZoom(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() =>
                inputRef.current?.click()
              }
              className="
                rounded-full
                border
                border-[#E7DCC8]
                px-6
                py-3
                text-sm
                font-medium
              "
            >
              Cambiar imagen
            </button>

            <button
  onClick={handleSave}
  disabled={!croppedAreaPixels}
  className="
    rounded-full
    bg-neutral-800
    px-6
    py-3
    text-sm
    font-medium
    text-white
    disabled:opacity-50
  "
>
  Guardar portada
</button>
          </div>
        </>
      )}
    </div>
  );
}