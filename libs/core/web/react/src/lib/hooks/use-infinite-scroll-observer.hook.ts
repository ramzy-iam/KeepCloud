// hooks/useInfiniteScrollObserver.ts
import { useEffect, useRef } from 'react';

export const useInfiniteScrollObserver = (
  onIntersect: () => void,
  hasMore: boolean,
  rootMargin = '0px',
) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin },
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasMore, onIntersect]);

  return ref;
};
