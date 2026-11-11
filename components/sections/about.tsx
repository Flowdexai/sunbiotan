'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)' },
};

export function About() {
  const t = useTranslations('About');

  return (
    <section
      id="sobre"
      className="py-16 md:py-28 bg-sunbiotan-100 relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-8 right-0 font-display font-light text-[32vw] leading-none text-sunbiotan-200/70 pointer-events-none select-none tracking-tighter pr-4"
        style={{ lineHeight: 0.85 }}
      >
        S
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 55% at 30% 50%, rgba(193,154,91,0.05) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="hidden md:flex flex-col items-start pt-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-sunbiotan-500/70" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-sunbiotan-700 font-medium whitespace-nowrap">
                {t('eyebrow')}
              </p>
            </div>
            <div className="w-px h-20 bg-gradient-to-b from-sunbiotan-500/60 to-transparent ml-4 mt-2" />
          </m.div>

          <div>
            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="flex md:hidden items-center gap-3 mb-8"
            >
              <div className="h-px w-8 bg-sunbiotan-500/70" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-sunbiotan-700 font-medium">
                {t('eyebrow')}
              </p>
            </m.div>

            <m.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="font-display font-light text-[clamp(2.1rem,4.4vw,3.6rem)] text-sunbiotan-900 mb-8 leading-[1.08] tracking-tight"
            >
              {t('headline')}
              <br />
              <em className="italic text-sunbiotan-600">{t('headlineItalic')}</em>
            </m.h2>

            <m.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              className="origin-left flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-sunbiotan-500/70" />
              <div className="w-1 h-1 rounded-full bg-sunbiotan-500" />
              <div className="h-px w-6 bg-sunbiotan-500/40" />
            </m.div>

            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="space-y-5 max-w-xl"
            >
              <p className="text-base md:text-lg text-sunbiotan-800 font-light leading-relaxed tracking-[0.01em]">
                {t('p1')}
              </p>
              <p className="text-base md:text-lg text-sunbiotan-800 font-light leading-relaxed tracking-[0.01em]">
                {t('p2')}
              </p>
            </m.div>

            <m.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="mt-10 max-w-xl border-l-2 border-sunbiotan-500 pl-5 font-display italic text-[1.4rem] md:text-[1.7rem] leading-snug text-sunbiotan-700"
            >
              {t('p3')}
            </m.p>

            <m.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mt-10 inline-flex items-center gap-3"
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-sunbiotan-500" />
              <p className="text-[11px] md:text-xs tracking-[0.2em] uppercase font-medium text-sunbiotan-700">
                {t('naturalIngredients')}
              </p>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
