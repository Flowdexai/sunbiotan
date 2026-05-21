'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap, Clock, Sparkles, Award } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.1 };

const STEP_ICONS = [Zap, Clock, Sparkles, Award] as const;
const STEP_KEYS = ['01', '02', '03', '04'] as const;

export function HowItWorks() {
  const t = useTranslations('HowItWorks');

  return (
    <section className="py-16 md:py-28 bg-sunbiotan-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '36px 36px' }}
      />

      <div
        className="absolute pointer-events-none"
        style={{ top: '-20%', right: '-10%', width: '55%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(193,154,91,0.06) 0%, transparent 65%)' }}
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-4 font-display font-light text-[26vw] leading-none text-sunbiotan-800/20 pointer-events-none select-none"
        style={{ lineHeight: 0.8 }}
      >
        04
      </div>

      <div className="container mx-auto px-6 relative">
        <m.div
          initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={VP}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="mb-20"
        >
          <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500 mb-4 font-medium">
            {t('eyebrow')}
          </p>
          <h2 className="font-display font-light text-[clamp(2.6rem,6vw,5rem)] text-sunbiotan-100 leading-[1.05] tracking-tight">
            {t('headline')}{' '}
            <em className="not-italic italic text-sunbiotan-400">{t('headlineItalic')}</em>
          </h2>
        </m.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6 max-w-6xl relative">
          {STEP_KEYS.map((key, index) => {
            const StepIcon = STEP_ICONS[index];
            return (
              <m.div
                key={key}
                initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={VP}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: EASE }}
                className="group relative"
              >
                {index < STEP_KEYS.length - 1 && (
                  <m.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={VP}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.12, ease: EASE }}
                    className="hidden lg:block absolute top-7 left-full h-px origin-left"
                    style={{ background: 'linear-gradient(to right, rgba(193,154,91,0.35), rgba(193,154,91,0.08))', width: 'calc(100% - 2rem)', transform: 'translateX(1rem)' }}
                  />
                )}

                <div className="flex items-start gap-3 mb-6">
                  <span className="font-display text-5xl md:text-6xl font-light leading-none text-sunbiotan-700/70 group-hover:text-sunbiotan-600/90 transition-colors duration-500 select-none">
                    {key}
                  </span>
                  <div className="mt-2 w-7 h-7 border border-sunbiotan-700/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-sunbiotan-500/55 transition-colors duration-300">
                    <StepIcon className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
                  </div>
                </div>

                <m.div
                  className="h-px mb-5 bg-sunbiotan-500 origin-left"
                  style={{ width: '3rem' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VP}
                  transition={{ duration: 0.6, delay: 0.25 + index * 0.1, ease: EASE }}
                />

                <h3 className="text-base font-medium text-sunbiotan-100 mb-3 tracking-wide">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="text-sm text-sunbiotan-400/60 font-light leading-relaxed">
                  {t(`steps.${key}.description`)}
                </p>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
