import type { ReactNode } from 'react';

interface SectionEyebrowProps {
  children: ReactNode;
  /** `light` = for cream/sand backgrounds, `dark` = for sunbiotan-950 / dark gradients. */
  tone?: 'light' | 'dark';
  /** `center` draws a rule on both sides; `start` draws a single leading rule. */
  align?: 'center' | 'start';
  className?: string;
}

const TONES = {
  // sunbiotan-700 on #fdfbf7 ≈ 6.0:1 · sunbiotan-400 on #1a130a ≈ 9.6:1
  light: { text: 'text-sunbiotan-700', rule: 'bg-sunbiotan-500/70' },
  dark: { text: 'text-sunbiotan-400', rule: 'bg-sunbiotan-500/60' },
} as const;

export function SectionEyebrow({ children, tone = 'light', align = 'center', className = '' }: SectionEyebrowProps) {
  const { text, rule } = TONES[tone];
  const centered = align === 'center';

  return (
    <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''} ${className}`}>
      <span aria-hidden="true" className={`h-px w-8 shrink-0 ${rule}`} />
      <p className={`min-w-0 text-[11px] leading-snug tracking-[0.35em] uppercase font-medium ${text}`}>
        {children}
      </p>
      {centered && <span aria-hidden="true" className={`h-px w-8 shrink-0 ${rule}`} />}
    </div>
  );
}
