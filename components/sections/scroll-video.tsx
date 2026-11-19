'use client';

import { useRef } from 'react';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AutoplayVideo } from '@/components/ui/autoplay-video';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Vídeo corto de la home. Usado también por la presentación profesional. */
export const SHORT_VIDEO_SRC = '/videos/SUNBIOTAN-musica.mp4';

export function VideoSection() {
  const t = useTranslations('VideoSection');
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative bg-sunbiotan-950 py-16 md:py-24">
      <m.div
        initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="text-center mb-10 px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-sunbiotan-600/50" />
          <p className="text-[11px] tracking-[0.45em] uppercase text-sunbiotan-400 font-medium">
            {t('eyebrow')}
          </p>
          <div className="h-px w-8 bg-sunbiotan-600/50" />
        </div>
        <h2 className="font-display font-light text-5xl md:text-7xl text-sunbiotan-100 leading-[1.05] tracking-tight">
          {t('headline')}{' '}
          <em className="italic text-sunbiotan-400">{t('headlineItalic')}</em>
        </h2>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className="container mx-auto px-6"
      >
        {/* La sección entera (no solo el reproductor) dispara la reproducción, como antes. */}
        <AutoplayVideo src={SHORT_VIDEO_SRC} clickHint={t('clickHint')} observeRef={sectionRef} />
      </m.div>
    </section>
  );
}
