'use client';

import { useId } from 'react';

/*
 * DECORATIVO — líneas finas doradas del hero de resultados (propias de esta
 * página; independientes de las de la presentación profesional). Para quitarlas
 * basta con borrar este archivo y su uso <ResultsHeroLines />.
 *
 * Rectas de 1 px (non-scaling-stroke) en sunbiotan-300 (currentColor), cada una
 * con su linearGradient: opacidad máxima en el extremo exterior y 0 hacia el
 * centro. Sin animación. Opacidades: dos a 0.30–0.33, el resto 0.18–0.24.
 *
 * viewBox 1440×800 estirado al tamaño del hero (preserveAspectRatio none). Zonas
 * libres, calculadas con el padding del hero (pt-30/md:pt-40, pb-18/md:pb-28):
 *   · franja superior: entre la navbar fija (que tapa ~y 0–110) y el eyebrow (~y 200);
 *   · franja inferior: debajo del texto (~y ≥ 650);
 *   · bordes laterales: x < 60 y x > 1380 (a 1024 px el bloque de texto llega a x ≈ 90–1350).
 * En móvil quedan 3 (a, c, g), en las franjas superior e inferior.
 */
const LINES = [
  // franja superior izquierda (móvil + escritorio)
  { id: 'a', x1: 0, y1: 190, x2: 560, y2: 120, o: 0.33, mobile: true },
  // franja inferior derecha: dos que se cruzan (móvil + escritorio)
  { id: 'c', x1: 1440, y1: 700, x2: 820, y2: 800, o: 0.3, mobile: true },
  { id: 'g', x1: 1440, y1: 785, x2: 1040, y2: 705, o: 0.2, mobile: true },
  // solo escritorio: franja superior derecha y bordes laterales
  { id: 'f', x1: 1440, y1: 190, x2: 980, y2: 115, o: 0.18, mobile: false },
  { id: 'd', x1: 1440, y1: 240, x2: 1385, y2: 800, o: 0.24, mobile: false },
  { id: 'e', x1: 0, y1: 230, x2: 60, y2: 800, o: 0.2, mobile: false },
] as const;

export function ResultsHeroLines() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 z-0 h-full w-full pointer-events-none text-sunbiotan-300"
      viewBox="0 0 1440 800"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        {LINES.map((l) => (
          <linearGradient key={l.id} id={`${uid}-${l.id}`} gradientUnits="userSpaceOnUse" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}>
            <stop offset="0" stopColor="currentColor" stopOpacity={l.o} />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {LINES.map((l) => (
        <line
          key={l.id}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={`url(#${uid}-${l.id})`}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          className={l.mobile ? undefined : 'hidden md:block'}
        />
      ))}
    </svg>
  );
}
