'use client';

// Página de resultados: hero → vídeos → banda de claves → fotos → cierre.
// Ritmo de fondos: oscuro (plano) / crema / oscuro (gradiente) / arena / oscuro.
// Sin efectos al scrollear: solo el fundido de Reveal.

import { m } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Sparkles, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from '@/i18n/navigation';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { BG, CARD_HOVER, EASE, PRIMARY_BUTTON, PhoneLink, Reveal, SectionHeader } from '@/components/pro/ui';
import { CONTACT_PHONE, whatsappHref } from '@/lib/contact';
import { ResultsHeroLines } from './results-hero-lines';
import { ResultsVideos } from './results-videos';
import { ResultsPhotos } from './results-photos';

// Íconos ya usados en el proyecto, en el orden de las claves de messages (ResultsPage.keys).
const KEY_ICONS = [Sun, Sparkles, Clock] as const;

export function ResultsPage() {
  const t = useTranslations('ResultsPage');
  const keys = t.raw('keys') as string[];

  return (
    <main>
      {/* 1. Hero — oscuro plano, sin foto */}
      <section className={`relative overflow-hidden ${BG.dark}`}>
        <ResultsHeroLines />
        {/*
          La navbar es fixed (h-16 / md:h-20): pt-30 = 64 + 56 de aire · md:pt-40 = 80 + 80 de aire.
        */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-30 pb-18 md:pt-40 md:pb-28 text-center">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex flex-col items-center"
          >
            <SectionEyebrow tone="dark" className="mb-6 [&_p]:text-sunbiotan-100">
              {t('heroEyebrow')}
            </SectionEyebrow>
            <h1 className="max-w-4xl font-display font-light leading-[1.08] tracking-tight text-balance text-[clamp(2rem,4.8vw,3.9rem)] text-sunbiotan-50 mb-6 md:mb-8">
              {t('heroLead')} <em className="italic text-sunbiotan-300">{t('heroAccent')}</em>
            </h1>
            <p className="text-base md:text-lg font-medium leading-relaxed text-sunbiotan-50 max-w-2xl">{t('heroText')}</p>
          </m.div>
        </div>
      </section>

      {/* 2. Vídeos — crema */}
      <ResultsVideos />

      {/* 3. Banda de claves — oscura y compacta */}
      <section className={`py-10 md:py-14 ${BG.darkGradient}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <Reveal className="max-w-5xl mx-auto">
            <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
              {keys.map((key, i) => {
                const Icon = KEY_ICONS[i] ?? Sparkles;
                return (
                  <li key={key} className="flex items-center justify-center gap-3 text-center sm:flex-col sm:gap-2">
                    <Icon className="h-6 w-6 shrink-0 text-sunbiotan-300" strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-sm md:text-base tracking-[0.06em] uppercase font-medium text-sunbiotan-50">{key}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 md:mt-8 text-center text-xs md:text-sm leading-relaxed text-sunbiotan-200">{t('keysNote')}</p>
          </Reveal>
        </div>
      </section>

      {/* 4. Fotos — arena */}
      <ResultsPhotos />

      {/* 5. Cierre — oscuro */}
      <section className={`py-16 md:py-24 ${BG.dark}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader tone="dark" eyebrow={t('closeEyebrow')} lead={t('closeLead')} accent={t('closeAccent')} />
          <Reveal className="flex flex-col items-center gap-6 -mt-2">
            <a
              href={whatsappHref(t('whatsappMessage'))}
              target="_blank"
              rel="noopener noreferrer"
              className={`${PRIMARY_BUTTON} cursor-pointer`}
            >
              <FontAwesomeIcon icon={faWhatsapp} style={{ width: '18px', height: '18px' }} aria-hidden="true" />
              <span>{t('closeCta')}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </a>
            <p className="text-sm md:text-base text-sunbiotan-200">
              {t('closePhone')}{' '}
              <PhoneLink
                display={CONTACT_PHONE.display}
                className="inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap font-semibold text-sunbiotan-50 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunbiotan-300"
              />
            </p>
            <Link
              href="/mapa-centros"
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-sunbiotan-300 text-sunbiotan-100 text-[13px] tracking-[0.12em] uppercase font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunbiotan-300 ${CARD_HOVER}`}
            >
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {t('closeMap')}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
