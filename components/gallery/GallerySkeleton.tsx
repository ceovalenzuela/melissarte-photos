interface Props {
  quantity?: number;
}

export default function GallerySkeleton({
  quantity = 8,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: quantity }).map((_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse rounded-2xl bg-neutral-100"
        />
      ))}
    </div>
  );
}