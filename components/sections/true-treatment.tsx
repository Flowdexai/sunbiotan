'use client';

import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { SectionHeading, splitTitle } from '@/components/ui/section-heading';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function TrueTreatment() {
  const t = useTranslations('TrueTreatment');
  const [lead, accent] = splitTitle(t('title'));

  return (
    <section className="py-16 md:py-28 bg-sunbiotan-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-10 md:gap-14 lg:gap-20 items-center">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <SectionEyebrow tone="light" align="start" className="mb-6 md:mb-8">
              {t('eyebrow')}
            </SectionEyebrow>
            <SectionHeading
              lead={lead}
              accent={accent}
              breakAccent
              className="text-[clamp(2.3rem,4.6vw,4rem)]"
            />
          </m.div>

          <m.div
            aria-hidden="true"
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={VP}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="hidden md:block w-px self-stretch origin-top bg-gradient-to-b from-transparent via-sunbiotan-500/70 to-transparent"
          />

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            <p className="text-base md:text-lg font-light leading-relaxed text-sunbiotan-800 mb-8 md:mb-10">
              {t('text')}
            </p>
            <Link
              href="/mapa-centros"
              className="group inline-flex items-center justify-center gap-2.5 px-7 md:px-9 py-3.5 md:py-4 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] border border-sunbiotan-700 text-sunbiotan-950 text-[13px] md:text-sm leading-snug tracking-[0.12em] uppercase font-bold text-center rounded-full transition-all duration-300 shadow-lg shadow-sunbiotan-700/15 hover:scale-[1.03]"
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
