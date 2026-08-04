export function createImage(
  url: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () =>
      resolve(image)
    );

    image.addEventListener("error", (error) =>
      reject(error)
    );

    image.setAttribute("crossOrigin", "anonymous");

    image.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "No fue posible generar la imagen."
            )
          );

          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function blobToFile(
  blob: Blob,
  fileName: string
): Promise<File> {
  return new File([blob], fileName, {
    type: blob.type,
  });
}