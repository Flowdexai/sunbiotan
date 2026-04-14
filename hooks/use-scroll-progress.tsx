// hooks/use-scroll-progress.tsx
'use client';

import { useEffect, useState } from 'react';

export function useScrollProgress(targetRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return;

      const element = targetRef.current;
      const rect = element.getBoundingClientRect();
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calcular progreso basado en posición del elemento
      const elementTop = rect.top;
      const elementBottom = rect.bottom;

      // El elemento está completamente visible
      if (elementTop >= 0 && elementBottom <= windowHeight) {
        const scrolled = windowHeight - elementTop;
        const total = elementHeight + windowHeight;
        setProgress(Math.min(scrolled / total, 1));
      }
      // El elemento está parcialmente visible (arriba)
      else if (elementTop < 0 && elementBottom > 0) {
        const scrolled = Math.abs(elementTop);
        const total = elementHeight;
        setProgress(Math.min(scrolled / total, 1));
      }
      // Elemento fuera de vista
      else if (elementBottom <= 0) {
        setProgress(1);
      } else {
        setProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetRef]);

  return progress;
}