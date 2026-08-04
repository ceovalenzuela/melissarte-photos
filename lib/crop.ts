import { Area } from "react-easy-crop";

import {
  blobToFile,
  canvasToBlob,
  createImage,
} from "./canvas";

const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 700;

export async function getCroppedImage(
  imageSrc: string,
  crop: Area,
  fileName = "cover.jpg"
): Promise<File> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "No fue posible crear el canvas."
    );
  }

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  const blob = await canvasToBlob(
    canvas,
    "image/jpeg",
    0.92
  );

  return blobToFile(blob, fileName);
}