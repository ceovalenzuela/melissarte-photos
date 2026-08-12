interface Props {
  quantity?: number;
}

export default function GallerySkeleton({
  quantity = 8,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: quantity }).map((_, index) => (
        <div
          key={index}
          className="
            aspect-square
            rounded-xl
            bg-[#F3EFE9]
            animate-pulse
          "
        />
      ))}
    </div>
  );
}