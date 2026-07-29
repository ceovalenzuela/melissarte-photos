import imageCompression from "browser-image-compression";

const compressionOptions = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 2048,
  initialQuality: 0.85,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return imageCompression(file, compressionOptions);
}