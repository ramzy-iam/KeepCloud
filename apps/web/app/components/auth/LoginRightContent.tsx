import { cn } from '@keepcloud/web-core/react';
import { useEffect, useRef, useState } from 'react';

export const LoginRightContent = ({ className }: { className?: string }) => {
  const [images] = useState([
    '/assets/svg/testimonial-container.svg',
    '/assets/svg/statistics-container.svg',
    '/assets/svg/feature-container.svg',
    '/assets/svg/free-storage-container.svg',
  ]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselParentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [imageOpacities, setImageOpacities] = useState<number[]>(
    new Array(images.length * 2).fill(0.6),
  );

  const updateImageOpacity = () => {
    const carousel = carouselRef.current;
    const carouselParent = carouselParentRef.current;
    if (!carousel || !carouselParent) return;

    const parentRect = carouselParent.getBoundingClientRect();
    const parentCenterY = parentRect.top + parentRect.height / 2;

    const imageElements = carousel.querySelectorAll('img');

    let closestIndex = -1;
    let closestDistance = Infinity;

    imageElements.forEach((img, index) => {
      const imgRect = img.getBoundingClientRect();
      const imgTop = imgRect.top;
      const imgBottom = imgRect.bottom;

      // Only consider images that are fully or mostly visible
      const isVisible =
        imgBottom > parentRect.top + 30 && imgTop < parentRect.bottom - 30;

      if (!isVisible) return;

      const imgCenterY = imgRect.top + imgRect.height / 2;
      const distance = Math.abs(parentCenterY - imgCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const newOpacities = Array.from({ length: imageElements.length }, (_, i) =>
      i === closestIndex ? 1 : 0.6,
    );

    setImageOpacities(newOpacities);
  };

  useEffect(() => {
    // Attach the scroll event listener
    const handleScroll = () => {
      updateImageOpacity();
    };

    const carousel = carouselRef.current;
    carousel?.addEventListener('scroll', handleScroll);

    // Initial opacity update when the page first loads
    updateImageOpacity();

    return () => {
      carousel?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const scrollSpeed = 1; // pixels per tick
    const frameRate = 16; // ~60fps

    const scrollStep = () => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      // Scroll down (which makes images move up)
      carousel.scrollTop += scrollSpeed;

      // Reset to top when reaching halfway (seamless loop)
      if (carousel.scrollTop >= carousel.scrollHeight / 2) {
        carousel.scrollTop = 0;
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.scrollTop = 0; // start at top
    }

    intervalRef.current = setInterval(scrollStep, frameRate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      ref={carouselParentRef}
      className={cn(
        'relative flex h-full max-h-full flex-col items-center overflow-hidden rounded-[12px]',
        className,
      )}
    >
      <div className="absolute top-0 left-0 h-full w-full">
        <img
          src={'/assets/images/03-Sky 2.png'}
          alt="sky"
          className="h-full w-full rounded-[12px] object-cover"
        />
      </div>

      {/* Carousel with images */}
      <div
        ref={carouselRef}
        className="no-scrollbar absolute top-0 left-0 flex h-full w-full flex-col items-center gap-10 overflow-y-scroll"
        style={{
          scrollBehavior: 'auto',
          maxHeight: '100%',
        }}
      >
        {[...images, ...images].map((src, index) => (
          <img
            key={`carousel-image-${index + 1}`}
            src={src}
            alt={`carousel-image-${index}`}
            width={330}
            height={400}
            className="object-cover"
            style={{ opacity: imageOpacities[index] }} // Dynamically changing opacity based on position
          />
        ))}
      </div>
    </div>
  );
};
