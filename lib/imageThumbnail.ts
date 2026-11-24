export async function createThumbnail(
  file: File,
  size = 800
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    image.onload = () => {
      // Never upscale small source images; only reduce oversized photos.
      const scale = Math.min(
        1,
        size / Math.max(image.width, image.height)
      );

      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        cleanup();
        reject(new Error("No se pudo crear el contexto del canvas."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          cleanup();

          if (!blob) {
            reject(new Error("No se pudo generar la miniatura."));
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, "");

          resolve(
            new File(
              [blob],
              `${baseName}.webp`,
              {
                type: "image/webp",
                lastModified: file.lastModified,
              }
            )
          );
        },
        "image/webp",
        0.76
      );
    };

    image.onerror = () => {
      cleanup();
      reject(new Error("No se pudo cargar la imagen."));
    };

    image.src = objectUrl;
  });
}
