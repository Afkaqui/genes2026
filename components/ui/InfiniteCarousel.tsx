'use client';

import { useRef, useEffect } from 'react';

interface InfiniteCarouselProps {
  children: React.ReactNode;
  /** Duración en segundos para recorrer todo el set de items */
  duration?: number;
  /** Pausa al hacer hover */
  pauseOnHover?: boolean;
  /** Gap entre items en px */
  gap?: number;
  className?: string;
}

export const InfiniteCarousel = ({
  children,
  duration = 20,
  pauseOnHover = true,
  gap = 24,
  className = '',
}: InfiniteCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Esperar un frame para que el layout se calcule
    const startAnimation = () => {
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth === 0) {
        // Layout aún no calculado, reintentar
        rafRef.current = requestAnimationFrame(startAnimation);
        return;
      }

      const speed = halfWidth / duration; // px por segundo

      const step = (timestamp: number) => {
        if (prevTimeRef.current === null) {
          prevTimeRef.current = timestamp;
        }

        const delta = (timestamp - prevTimeRef.current) / 1000;
        prevTimeRef.current = timestamp;

        if (!isPausedRef.current) {
          posRef.current += speed * delta;

          if (posRef.current >= halfWidth) {
            posRef.current -= halfWidth;
          }

          track.style.transform = `translateX(-${posRef.current}px)`;
        }

        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    };

    startAnimation();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  const handleMouseEnter = () => {
    if (pauseOnHover) isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      isPausedRef.current = false;
      prevTimeRef.current = null; // Evitar salto al reanudar
    }
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ gap: `${gap}px` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
};
