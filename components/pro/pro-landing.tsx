'use client';

// Página pública del flujo profesional: hero → por qué → cómo funciona →
// red de centros → formulario. Ritmo de fondos: oscuro (imagen) / crema /
// oscuro (gradiente) / arena / crema; nunca dos contiguas iguales.

import { m } from 'framer-motion';
import { ArrowRight, GraduationCap, Sparkles, Package, MapPin, Leaf, Handshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { PRO_SESSION_MINUTES, type ProFlow } from '@/lib/pro/config';
import { ProForm } from './pro-form';
import { BG, EASE, PRIMARY_BUTTON, Reveal, SectionHeader } from './ui';

const WHY_ICONS = [GraduationCap, Sparkles, Package, MapPin, Leaf, Handshake] as const;

// Indicadores en 2×2 con cruz en móvil y una fila desde md (mismo patrón que el Hero).
const STAT_BORDERS = [
  'border-r border-b md:border-b-0',
  'border-b md:border-b-0 md:border-r',
  'border-r',
  '',
] as const;

interface Item { title: string; text: string }
interface Stat { value: string; label: string }

export function ProLanding({ flow }: { flow: ProFlow }) {
  const t = useTranslations('ProLanding');
  const stats = t.raw('stats') as Stat[];
  const why = t.raw('why') as Item[];
  const steps = t.raw('steps') as Item[];

  return (
    <main>
      {/* 1. Hero — oscuro con imagen (mismo tratamiento que el Hero de la landing) */}
      <section className={`relative min-h-[92svh] flex items-center overflow-hidden ${BG.dark}`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover opacity-95"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundPosition: 'center 20%' }}
        />
        {/* La capa uniforme del 72 % garantiza el contraste sobre el píxel más claro de la imagen. */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-sunbiotan-950/72" />
          <div className="absolute inset-0 bg-gradient-to-b from-sunbiotan-950/50 via-transparent to-sunbiotan-950/60" />
        </div>

        <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 pt-28 pb-12 md:pt-36 md:pb-16 text-center">
          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            <SectionEyebrow tone="dark" className="mb-5 [&_p]:text-sunbiotan-100">
              {t('heroEyebrow')}
            </SectionEyebrow>
            <h1 className="font-display font-light leading-[0.98] tracking-tight mb-6">
              <span className="block text-[clamp(2.4rem,8vw,6.5rem)] text-sunbiotan-50">{t('heroHeadline1')}</span>
              <span className="block text-[clamp(2.4rem,8vw,6.5rem)] italic text-sunbiotan-300">{t('heroHeadline2')}</span>
            </h1>
            <p className="text-base md:text-lg font-medium leading-relaxed text-sunbiotan-50 max-w-2xl mx-auto mb-8">
              {t('heroSubtitle')}
            </p>
            <a href="#formulario" className={PRIMARY_BUTTON}>
              <span>{t('heroCta')}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </a>
          </m.div>

          <m.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
            className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto border-t border-sunbiotan-400/60"
          >
            {stats.map((s, i) => (
              <li
                key={s.value}
                className={`flex flex-col items-center justify-center text-center px-2 md:px-4 py-4 md:py-6 border-sunbiotan-400/45 ${STAT_BORDERS[i] ?? ''}`}
              >
                <span className="font-display text-[1.2rem] md:text-[1.6rem] leading-tight text-sunbiotan-300 mb-1">{s.value}</span>
                <span className="text-[11px] md:text-xs leading-snug tracking-[0.14em] uppercase font-medium text-sunbiotan-100">{s.label}</span>
              </li>
            ))}
          </m.ul>
        </div>
      </section>

      {/* 2. Por qué — crema */}
      <section className={`py-16 md:py-24 ${BG.cream}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader tone="light" eyebrow={t('whyEyebrow')} lead={t('whyLead')} accent={t('whyAccent')} />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {why.map((item, i) => {
              const Icon = WHY_ICONS[i] ?? Sparkles;
              return (
                <Reveal as="li" key={item.title} delay={i * 0.05} className="h-full bg-white border border-sunbiotan-200 rounded-2xl p-6 md:p-7">
                    <Icon className="h-6 w-6 text-sunbiotan-700 mb-4" strokeWidth={1.5} aria-hidden="true" />
                    <h3 className="font-display text-2xl text-sunbiotan-900 mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-sunbiotan-800">{item.text}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3. Cómo funciona — oscuro (gradiente de la landing) */}
      <section className={`py-16 md:py-24 ${BG.darkGradient}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader tone="dark" eyebrow={t('howEyebrow')} lead={t('howLead')} accent={t('howAccent')} />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.06} className="h-full border border-sunbiotan-700 rounded-2xl p-6">
                  <span className="block font-display text-4xl text-sunbiotan-400 mb-3">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-2xl text-sunbiotan-50 mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-sunbiotan-200">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Red de centros — arena */}
      <section className={`py-16 md:py-24 ${BG.sandDeep}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            tone="light"
            eyebrow={t('networkEyebrow')}
            lead={t('networkLead')}
            accent={t('networkAccent')}
            intro={t('networkText')}
          />
          <Reveal className="flex justify-center -mt-4">
            <Link
              href="/mapa-centros"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-sunbiotan-800 text-sunbiotan-900 text-[13px] tracking-[0.12em] uppercase font-semibold hover:bg-sunbiotan-900 hover:text-sunbiotan-50 transition-colors"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {t('networkCta')}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. Formulario — crema */}
      <section id="formulario" className={`py-16 md:py-24 scroll-mt-16 ${BG.cream}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            tone="light"
            eyebrow={t('formEyebrow')}
            lead={t('formLead')}
            accent={t('formAccent')}
            intro={t('formSubtitle', { minutes: PRO_SESSION_MINUTES })}
          />
          <Reveal className="max-w-xl mx-auto">
            <div className="relative bg-white border border-sunbiotan-200 rounded-2xl p-5 sm:p-8 shadow-sm">
              <ProForm flow={flow} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
