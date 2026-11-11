import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Main part of the title. */
  lead: ReactNode;
  /** Final part, set in italic gold. Optional. */
  accent?: ReactNode;
  /** Put the accent on its own line instead of continuing the sentence. */
  breakAccent?: boolean;
  tone?: 'light' | 'dark';
  as?: 'h2' | 'h3';
  /** Size / spacing overrides. Defaults to the section-title scale used across the landing. */
  className?: string;
}

const TONES = {
  // Large text (≥ 24px): needs 3:1. sunbiotan-600 on #fdfbf7 ≈ 3.7:1 · sunbiotan-300 on #1a130a ≈ 12.6:1
  light: { lead: 'text-sunbiotan-900', accent: 'text-sunbiotan-600' },
  dark: { lead: 'text-sunbiotan-100', accent: 'text-sunbiotan-300' },
} as const;

export function SectionHeading({
  lead,
  accent,
  breakAccent = false,
  tone = 'light',
  as: Tag = 'h2',
  className = 'text-[clamp(2.6rem,6vw,5rem)]',
}: SectionHeadingProps) {
  const colors = TONES[tone];

  return (
    <Tag className={`font-display font-light leading-[1.05] tracking-tight ${colors.lead} ${className}`}>
      {lead}
      {accent && (
        <>
          {breakAccent ? <br /> : ' '}
          <em className={`italic ${colors.accent}`}>{accent}</em>
        </>
      )}
    </Tag>
  );
}

/**
 * Splits "First sentence. Second sentence." into [lead, accent] at the first sentence break,
 * so a single i18n string can still get the italic gold ending. Returns [text, undefined] if
 * there is no break.
 */
export function splitTitle(title: string): [string, string | undefined] {
  const m = title.match(/^(.+?[.?!])\s+(.+)$/);
  return m ? [m[1], m[2]] : [title, undefined];
}
