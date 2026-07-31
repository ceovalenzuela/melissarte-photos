import { toast } from "sonner";

interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

export async function share({
  title,
  text,
  url,
}: ShareOptions) {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });

      return;
    }

    await navigator.clipboard.writeText(url);

    toast.success("Enlace copiado. Ya puedes pegarlo donde quieras.");
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return;
    }

    toast.error("No fue posible compartir la galería.");
  }
}