'use client';

import { Fragment } from 'react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.3 };

const fadeUp = {
  hidden: { opacity: 0, y: 12, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function FormulaStrip() {
  const t = useTranslations('FormulaStrip');
  const items = t.raw('items') as string[];

  return (
    <section className="relative bg-sunbiotan-950">
      <div className="h-px bg-gradient-to-r from-transparent via-sunbiotan-500/60 to-transparent" />

      <m.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={VP}
        transition={{ duration: 0.7, ease: EASE }}
        className="container mx-auto px-6 py-8 md:py-10 text-center"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:gap-x-0">
          {items.map((item, i) => (
            <Fragment key={item}>
              {i > 0 && (
                <li aria-hidden="true" className="hidden md:block px-5 text-sunbiotan-500 select-none">
                  ·
                </li>
              )}
              <li className="text-[11px] md:text-xs tracking-[0.24em] uppercase font-medium text-sunbiotan-200">
                {item}
              </li>
            </Fragment>
          ))}
        </ul>

        <p className="mt-5 md:mt-6 font-display italic text-lg md:text-xl leading-snug text-sunbiotan-300 max-w-2xl mx-auto">
          {t('text')}
        </p>
      </m.div>

      <div className="h-px bg-gradient-to-r from-transparent via-sunbiotan-500/60 to-transparent" />
    </section>
  );
}
