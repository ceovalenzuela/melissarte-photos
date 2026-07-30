export async function createThumbnail(
  file: File,
  size = 800
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(
        size / image.width,
        size / image.height
      );

      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("No se pudo crear el contexto del canvas."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(image.src);

          if (!blob) {
            reject(new Error("No se pudo generar la miniatura."));
            return;
          }

          resolve(
            new File(
              [blob],
              file.name.replace(/\.\w+$/, ".webp"),
              {
                type: "image/webp",
                lastModified: file.lastModified,
              }
            )
          );
        },
        "image/webp",
        0.9
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error("No se pudo cargar la imagen."));
    };

    image.src = URL.createObjectURL(file);
  });
}