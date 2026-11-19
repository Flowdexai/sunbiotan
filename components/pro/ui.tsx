'use client';

// Piezas compartidas por la página pública y la presentación profesional.
// Colores solo con tokens sunbiotan-* (sin hex sueltos ni opacidades bajas en
// texto); pares de contraste verificados en el informe.

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { SectionHeading } from '@/components/ui/section-heading';
import { CONTACT_TEL_HREF } from '@/lib/contact';

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const VIEWPORT = { once: true, amount: 0.15 };

/** Botón primario dorado (mismo tratamiento que los CTA de la landing). */
export const PRIMARY_BUTTON =
  'group inline-flex items-center justify-center gap-2.5 px-7 md:px-9 py-3.5 md:py-4 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] text-sunbiotan-950 text-[13px] md:text-sm leading-snug tracking-[0.12em] uppercase font-bold text-center rounded-full transition-all duration-300 shadow-xl shadow-black/20 hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100';

/** Fondos del ritmo oscuro / arena / crema (tokens de la landing). */
export const BG = {
  dark: 'bg-sunbiotan-950',
  /**
   * Equivalente en tokens al gradiente de components/sections/cta-professionals.tsx
   * (sunbiotan-950 → sunbiotan-900; el tono intermedio de allá cae en esta interpolación).
   */
  darkGradient: 'bg-gradient-to-br from-sunbiotan-950 to-sunbiotan-900',
  cream: 'bg-sunbiotan-50',
  sand: 'bg-sunbiotan-100',
  sandDeep: 'bg-sunbiotan-200',
} as const;

export type Tone = 'light' | 'dark';

export function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** `li` para usarlo directamente dentro de <ul>/<ol>. */
  as?: 'div' | 'li';
}) {
  const props = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.7, delay, ease: EASE },
    className,
  };
  return as === 'li' ? <m.li {...props}>{children}</m.li> : <m.div {...props}>{children}</m.div>;
}

/** Cabecera de sección: eyebrow + título con acento en cursiva dorada. */
export function SectionHeader({
  eyebrow,
  lead,
  accent,
  tone,
  intro,
  align = 'center',
  as = 'h2',
}: {
  eyebrow: string;
  lead: string;
  accent?: string;
  tone: Tone;
  intro?: ReactNode;
  align?: 'center' | 'start';
  as?: 'h1' | 'h2';
}) {
  const centered = align === 'center';
  const heading = (
    <SectionHeading
      tone={tone}
      lead={lead}
      accent={accent}
      as={as === 'h1' ? 'h2' : as}
      className="text-[clamp(2.1rem,5.5vw,4rem)]"
    />
  );
  return (
    <Reveal className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl mb-10 md:mb-14`}>
      <SectionEyebrow tone={tone} align={align} className="mb-4">
        {eyebrow}
      </SectionEyebrow>
      {heading}
      {intro && (
        <p className={`mt-5 text-base md:text-lg leading-relaxed ${tone === 'dark' ? 'text-sunbiotan-200' : 'text-sunbiotan-800'} ${centered ? 'mx-auto' : ''} max-w-2xl`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}

/** Teléfono visible con enlace tel: (fuente única en lib/contact.ts). */
export function PhoneLink({ display, className = '' }: { display: string; className?: string }) {
  return (
    <a href={CONTACT_TEL_HREF} className={`underline-offset-4 hover:underline ${className}`}>
      {display}
    </a>
  );
}
