const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://events.melissartedecorativo.com";

export function getEventUrl(slug: string) {
  return `${APP_ORIGIN}/e/${slug}`;
}

export function getPhotoUrl(
  slug: string,
  photoId: string
) {
  return `${APP_ORIGIN}/e/${slug}?photo=${encodeURIComponent(photoId)}`;
}
