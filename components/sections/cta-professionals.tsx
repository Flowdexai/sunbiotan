'use client';

import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SectionHeading } from '@/components/ui/section-heading';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

// 2×2 with a cross on mobile, single row with vertical dividers from md up (same pattern as the hero indicators).
const POINT_BORDERS = [
  'border-r border-b md:border-b-0',
  'border-b md:border-b-0 md:border-r',
  'border-r',
  '',
] as const;

export function CtaProfessionals() {
  const t = useTranslations('CtaProfessionals');
  const points = t.raw('points') as string[];

  return (
    <section
      id="profissionais"
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #1a130a 0%, #261b0e 45%, #3d2e17 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.032] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '30px 30px' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <SectionHeading tone="dark" lead={t('title')} className="text-[clamp(2.3rem,5vw,4rem)] mb-6" />
            <p className="text-base md:text-lg font-light leading-relaxed text-sunbiotan-200 max-w-2xl mx-auto">
              {t('text')}
            </p>
          </m.div>

          <m.ul
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 border-t border-sunbiotan-500/45"
          >
            {points.map((point, i) => (
              <li
                key={point}
                className={`flex items-center justify-center px-3 md:px-5 py-5 md:py-7 border-sunbiotan-500/35 ${POINT_BORDERS[i]}`}
              >
                <span className="text-[11px] md:text-xs leading-snug tracking-[0.16em] uppercase font-medium text-sunbiotan-100">
                  {point}
                </span>
              </li>
            ))}
          </m.ul>

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="mt-10 md:mt-14 flex justify-center"
          >
            <Link
              href="/profissionais"
              className="group inline-flex items-center justify-center gap-2.5 px-7 md:px-9 py-3.5 md:py-4 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] text-sunbiotan-950 text-[13px] md:text-sm leading-snug tracking-[0.12em] uppercase font-bold text-center rounded-full transition-all duration-300 shadow-xl shadow-black/30 hover:scale-[1.03]"
            >
              <span>{t('cta')}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}
