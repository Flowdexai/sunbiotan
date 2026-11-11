'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SectionHeading, splitTitle } from '@/components/ui/section-heading';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function Occasions() {
  const t = useTranslations('Occasions');
  const items = t.raw('items') as string[];
  const [lead, accent] = splitTitle(t('title'));

  return (
    <section className="py-16 md:py-28 bg-sunbiotan-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '36px 36px' }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="mb-12 md:mb-16"
          >
            <SectionHeading
              tone="dark"
              lead={lead}
              accent={accent}
              breakAccent
              className="text-[clamp(2.1rem,4.4vw,3.75rem)] max-w-4xl"
            />
          </m.div>

          <ol className="border-t border-sunbiotan-500/35">
            {items.map((item, i) => (
              <m.li
                key={item}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: EASE }}
                className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[4.5rem_1fr] items-baseline py-5 md:py-7 border-b border-sunbiotan-500/35"
              >
                <span className="text-[11px] md:text-xs tracking-[0.2em] font-medium text-sunbiotan-400 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display italic font-light text-[1.75rem] md:text-[2.75rem] leading-[1.1] text-sunbiotan-100">
                  {item}
                </span>
              </m.li>
            ))}
          </ol>

          <m.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-12 md:mt-16 text-center font-display italic text-xl md:text-2xl leading-snug text-sunbiotan-300 max-w-2xl mx-auto"
          >
            {t('closing')}
          </m.p>
        </div>
      </div>
    </section>
  );
}
