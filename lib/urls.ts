export function getEventUrl(
  origin: string,
  slug: string
) {
  return `${origin}/e/${slug}`;
}

export function getPhotoUrl(
  origin: string,
  slug: string,
  photoId: string
) {
  return `${origin}/e/${slug}?photo=${photoId}`;
}