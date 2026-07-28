"use client";

import { useEffect, useRef } from "react";

interface Props {
  onLoadMore: () => void;
  disabled?: boolean;
}

export default function InfiniteScrollTrigger({
  onLoadMore,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [disabled, onLoadMore]);

  return <div ref={ref} className="h-1 w-full" />;
}