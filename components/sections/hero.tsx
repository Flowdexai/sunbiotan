'use client';

import { useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

// Divider layout for the indicators: 2×2 grid with a cross on mobile,
// single row with vertical dividers from md up.
const STAT_BORDERS = [
  'border-r border-b md:border-b-0',
  'border-b md:border-b-0 md:border-r',
  'border-r',
  '',
] as const;

const STAT_KEYS = ['stat1', 'stat2', 'stat3', 'stat4'] as const;

export function Hero() {
  const t = useTranslations('Hero');
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Content parallax only — the overlay keeps a fixed opacity so it never lightens on scroll.
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  const scrollToNext = () =>
    window.scrollTo({ top: heroRef.current?.offsetHeight ?? window.innerHeight, behavior: 'smooth' });

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-sunbiotan-950"
    >
      <div
        className="absolute inset-0 w-full h-full bg-cover opacity-95"
        style={{
          backgroundImage: 'url(/images/hero-bg.jpg)',
          backgroundPosition: 'center 20%',
          backgroundSize: 'cover',
        }}
      />

      {/*
        Warm overlay (#1a130a). The uniform 72% layer alone guarantees WCAG contrast
        against the brightest pixel of hero-bg.jpg; the other two layers only add depth
        (darker top/bottom for navbar and indicators, extra density behind the text).
      */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#1a130a]/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a130a]/50 via-transparent to-[#1a130a]/60" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(26,19,10,0.35) 0%, rgba(26,19,10,0.15) 60%, transparent 100%)',
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <m.div
        style={{ y: contentY }}
        className="relative z-10 w-full container mx-auto px-6 text-center pt-20 pb-8 md:pt-32 md:pb-16"
      >
        <m.div variants={containerVariants} initial="hidden" animate="show">
          <m.div variants={itemVariants} className="mb-2">
            <p className="font-display font-light text-[clamp(2rem,3vw,2rem)] tracking-[0.55em] uppercase text-sunbiotan-200/90">
              SUNBIOTAN
            </p>
          </m.div>

          <m.div variants={itemVariants} className="flex items-center justify-center gap-2 md:gap-4 mb-3 md:mb-5">
            <div className="h-px w-5 md:w-14 flex-shrink-0 bg-sunbiotan-400/80" />
            <p className="min-w-0 text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.38em] uppercase text-sunbiotan-100/90 font-medium">
              {t('eyebrow')}
            </p>
            <div className="h-px w-5 md:w-14 flex-shrink-0 bg-sunbiotan-400/80" />
          </m.div>

          <m.div variants={itemVariants} className="mb-4 md:mb-6">
            <h1 className="font-display font-light leading-[0.95] tracking-tight">
              <span className="block text-[clamp(2.6rem,9vw,7.5rem)] text-sunbiotan-50">
                {t('headline1')}
              </span>
              <span className="block text-[clamp(2.6rem,9vw,7.5rem)] golden-shimmer-light">
                {t('headline2')}
              </span>
            </h1>
          </m.div>

          <m.p
            variants={itemVariants}
            className="text-base md:text-lg font-medium leading-relaxed text-sunbiotan-50/95 max-w-xl md:max-w-2xl mx-auto mb-6 md:mb-9"
            style={{ textShadow: '0 1px 14px rgba(26,19,10,0.65)' }}
          >
            {t('subtitle')}
          </m.p>

          <m.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto mb-8 md:mb-14"
          >
            <Link
              href="/mapa-centros"
              className="group inline-flex items-center justify-center gap-2.5 px-7 md:px-9 py-3.5 md:py-4 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] text-sunbiotan-950 text-[13px] md:text-sm leading-snug tracking-[0.12em] uppercase font-bold text-center rounded-full transition-all duration-300 shadow-xl shadow-black/30 hover:scale-[1.03]"
            >
              <span>{t('cta1')}</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </Link>

            <Link
              href="/profissionais"
              className="inline-flex items-center justify-center px-7 md:px-9 py-3.5 md:py-4 border-[1.5px] border-sunbiotan-50/80 hover:border-white text-white text-[13px] md:text-sm leading-snug tracking-[0.12em] uppercase font-semibold text-center rounded-full transition-all duration-300 hover:bg-white/8"
            >
              {t('cta2')}
            </Link>
          </m.div>

          <m.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto border-t border-sunbiotan-400/60"
          >
            {STAT_KEYS.map((key, i) => (
              <div
                key={key}
                className={`flex flex-col items-center justify-center text-center px-2 md:px-4 py-4 md:py-6 border-sunbiotan-400/45 ${STAT_BORDERS[i]}`}
              >
                <div className="font-display text-[1.35rem] md:text-[1.7rem] leading-tight font-normal text-sunbiotan-300 mb-1">
                  {t(`${key}Value`)}
                </div>
                <div className="text-[11px] md:text-xs leading-snug tracking-[0.14em] uppercase font-medium text-sunbiotan-100/90">
                  {t(`${key}Label`)}
                </div>
              </div>
            ))}
          </m.div>
        </m.div>
      </m.div>

      <m.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="hidden md:block absolute bottom-5 left-1/2 -translate-x-1/2 text-sunbiotan-300/60 hover:text-sunbiotan-200 transition-colors duration-300 cursor-pointer"
        aria-label={t('scroll')}
      >
        <m.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="h-5 w-5" />
        </m.div>
      </m.button>
    </section>
  );
}
