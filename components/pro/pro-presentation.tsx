'use client';

// Presentación reservada. Fondos: oscuro (hero, comparativo, vídeo, cierre) y
// claro (tratamento, sistema, rentabilidade, FAQ), nunca dos contiguos iguales.
// Los claims viven en messages → ProPresentation.claims (fuera de la estructura).

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Phone, Play, Truck, ShieldCheck, GraduationCap } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AutoplayVideo } from '@/components/ui/autoplay-video';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { SHORT_VIDEO_SRC } from '@/components/sections/scroll-video';
import { CONTACT_PHONE } from '@/lib/contact';
import { PRO_SESSION_MINUTES } from '@/lib/pro/config';
import { ProNavbar } from './pro-navbar';
import { PRO_VISIT_URL, trackWhatsappInterest } from './track';
import { BG, EASE, PRIMARY_BUTTON, PhoneLink, Reveal, SectionHeader } from './ui';

interface Item { title: string; text: string }
interface Column { name: string; cells: string[] }
interface Figure { value: string; label: string }
interface Faq { q: string; a: string }

export interface ProPresentationProps {
  /** Primer nombre del lead, para el saludo. */
  firstName: string;
  /** wa.me con el mensaje prearmado en el idioma del lead. */
  whatsappUrl: string;
}

const SYSTEM_BAR_ICONS = [Truck, ShieldCheck, GraduationCap] as const;

/** CTA de WhatsApp rastreado: el href real funciona aunque falle el beacon. */
function WhatsappCta({ href, label, className = '' }: { href: string; label: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={trackWhatsappInterest} className={`${PRIMARY_BUTTON} ${className}`}>
      <FontAwesomeIcon icon={faWhatsapp} style={{ width: '18px', height: '18px' }} aria-hidden="true" />
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
    </a>
  );
}

function BenefitCard({ item, index }: { item: Item; index: number }) {
  const t = useTranslations('ProPresentation');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <Reveal as="li" delay={index * 0.04} className="bg-white border border-sunbiotan-200 rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-start gap-4 text-left p-5 md:p-6"
      >
        <span className="font-display text-2xl leading-none text-sunbiotan-700 pt-1 w-8 shrink-0">{String(index + 1).padStart(2, '0')}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-xl md:text-2xl leading-snug text-sunbiotan-900">{item.title}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs tracking-[0.12em] uppercase font-medium text-sunbiotan-700">
            {open ? t('showLess') : t('showMore')}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </span>
        </span>
      </button>
      <div id={panelId} hidden={!open} className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 pl-[4.25rem] md:pl-[4.5rem]">
        <p className="text-sm leading-relaxed text-sunbiotan-800">{item.text}</p>
      </div>
    </Reveal>
  );
}

function Comparison({ rows, columns, rowsLabel }: { rows: string[]; columns: Column[]; rowsLabel: string }) {
  const [tab, setTab] = useState(0);
  const tabsId = useId();
  return (
    <>
      {/* Móvil: tarjetas con pestañas */}
      <div className="md:hidden">
        <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-full border border-sunbiotan-700 mb-5">
          {columns.map((col, i) => (
            <button
              key={col.name}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${tabsId}-panel`}
              onClick={() => setTab(i)}
              className={`px-2 py-2 rounded-full text-[12px] font-semibold tracking-wide transition-colors ${
                tab === i ? 'bg-sunbiotan-300 text-sunbiotan-950' : 'text-sunbiotan-100 hover:text-sunbiotan-50'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${tabsId}-panel`}
          aria-labelledby={`${tabsId}-tab-${tab}`}
          className={`rounded-2xl border p-5 space-y-4 ${tab === 0 ? 'border-sunbiotan-400 bg-sunbiotan-900' : 'border-sunbiotan-700'}`}
        >
          {rows.map((row, r) => (
            <div key={row}>
              <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-sunbiotan-300 mb-1">{row}</p>
              <p className="text-sm leading-relaxed text-sunbiotan-100">{columns[tab]?.cells[r]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desde md: tabla de 3 columnas, Sun BioTan® destacado */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <table className="w-full table-fixed border-separate border-spacing-x-3">
          <caption className="sr-only">{columns.map((c) => c.name).join(' · ')}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[18%] text-left align-bottom pb-4 text-[11px] tracking-[0.18em] uppercase font-medium text-sunbiotan-300">
                {rowsLabel}
              </th>
              {columns.map((col, i) => (
                <th
                  key={col.name}
                  scope="col"
                  className={`text-left px-5 pt-5 pb-4 font-display text-2xl font-normal rounded-t-2xl ${
                    i === 0 ? 'bg-sunbiotan-900 text-sunbiotan-200 border-x border-t border-sunbiotan-400' : 'text-sunbiotan-100'
                  }`}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row}>
                <th scope="row" className="text-left align-top py-4 pr-2 text-[11px] tracking-[0.18em] uppercase font-medium text-sunbiotan-300 border-t border-sunbiotan-800">
                  {row}
                </th>
                {columns.map((col, i) => (
                  <td
                    key={col.name}
                    className={`align-top px-5 py-4 text-sm leading-relaxed border-t ${
                      i === 0
                        ? `bg-sunbiotan-900 text-sunbiotan-50 border-x border-sunbiotan-400 ${r === rows.length - 1 ? 'border-b rounded-b-2xl' : ''}`
                        : 'text-sunbiotan-200 border-sunbiotan-800'
                    }`}
                  >
                    {col.cells[r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className="border-b border-sunbiotan-400 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-center justify-between gap-4 py-5 text-left font-display text-xl md:text-2xl text-sunbiotan-900"
        >
          {item.q}
          <ChevronDown className={`h-5 w-5 shrink-0 text-sunbiotan-800 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="pb-5">
        <p className="text-sm md:text-base leading-relaxed text-sunbiotan-900">{item.a}</p>
      </div>
    </li>
  );
}

export function ProPresentation({ firstName, whatsappUrl }: ProPresentationProps) {
  const t = useTranslations('ProPresentation');
  const heroKeys = t.raw('heroKeys') as string[];
  const benefits = t.raw('claims.benefits') as Item[];
  const comparison = t.raw('claims.comparison') as { rows: string[]; columns: Column[] };
  const business = t.raw('claims.business') as string[];
  const system = t.raw('claims.system') as Item[];
  const systemBar = t.raw('claims.systemBar') as string[];
  const profit = t.raw('claims.profit') as Figure[];
  const faq = t.raw('claims.faq') as Faq[];

  // Registro de la visita (una vez por montaje; el servidor descarta repeticiones < 5 min).
  const visited = useRef(false);
  useEffect(() => {
    if (visited.current) return;
    visited.current = true;
    void fetch(PRO_VISIT_URL, { method: 'POST', credentials: 'same-origin', keepalive: true }).catch(() => {});
  }, []);

  return (
    <>
      <ProNavbar whatsappUrl={whatsappUrl} />

      <main>
        {/* 1. Hero — oscuro */}
        <section id="inicio" className={`relative overflow-hidden ${BG.dark}`}>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover opacity-95"
            style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundPosition: 'center 20%' }}
          />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-sunbiotan-950/72" />
            <div className="absolute inset-0 bg-gradient-to-b from-sunbiotan-950/50 via-transparent to-sunbiotan-950/70" />
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-32 pb-16 md:pt-44 md:pb-24 text-center">
            <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
              <SectionEyebrow tone="dark" className="mb-5 [&_p]:text-sunbiotan-100">{t('heroEyebrow')}</SectionEyebrow>
              <p className="font-display text-[clamp(1.6rem,4vw,2.4rem)] text-sunbiotan-300 mb-3">
                {t('heroGreeting', { name: firstName })}
              </p>
              <h1 className="font-display font-light leading-[1.02] tracking-tight text-[clamp(2.3rem,7vw,5.5rem)] text-sunbiotan-50 mb-6">
                {t('heroLead')} <em className="italic text-sunbiotan-300">{t('heroAccent')}</em>
              </h1>
              <p className="text-base md:text-lg font-medium leading-relaxed text-sunbiotan-50 max-w-2xl mx-auto mb-8">
                {t('heroText', { minutes: PRO_SESSION_MINUTES })}
              </p>
              <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
                {heroKeys.map((k) => (
                  <li key={k} className="inline-flex items-center justify-center gap-2 text-sm tracking-[0.08em] uppercase font-medium text-sunbiotan-100">
                    <Check className="h-4 w-4 text-sunbiotan-300" strokeWidth={2.25} aria-hidden="true" />
                    {k}
                  </li>
                ))}
              </ul>
              <WhatsappCta href={whatsappUrl} label={t('heroCta')} />
            </m.div>
          </div>
        </section>

        {/* 2. O tratamento — crema */}
        <section id="tratamento" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.cream}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader tone="light" eyebrow={t('treatmentEyebrow')} lead={t('treatmentLead')} accent={t('treatmentAccent')} />
            <ul className="grid md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto items-start">
              {benefits.map((item, i) => <BenefitCard key={item.title} item={item} index={i} />)}
            </ul>
          </div>
        </section>

        {/* 3. Comparativo — oscuro */}
        <section id="comparativo" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.dark}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader tone="dark" eyebrow={t('comparisonEyebrow')} lead={t('comparisonLead')} accent={t('comparisonAccent')} />
            <Reveal>
              <Comparison rows={comparison.rows} columns={comparison.columns} rowsLabel={t('comparisonRowsLabel')} />
            </Reveal>
          </div>
        </section>

        {/* 4. Sistema completo — arena */}
        <section id="sistema" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.sand}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader tone="light" eyebrow={t('systemEyebrow')} lead={t('systemLead')} accent={t('systemAccent')} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
              {system.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 0.05} className="bg-white border border-sunbiotan-200 rounded-2xl p-6">
                  <span className="block font-display text-3xl text-sunbiotan-700 mb-2">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-2xl text-sunbiotan-900 mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-sunbiotan-800">{item.text}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-8 max-w-6xl mx-auto">
              <ul className="flex flex-col md:flex-row md:justify-center gap-3 md:gap-0 rounded-2xl bg-sunbiotan-950 px-6 py-5">
                {systemBar.map((label, i) => {
                  const Icon = SYSTEM_BAR_ICONS[i] ?? Check;
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-2.5 text-sm tracking-[0.08em] uppercase font-semibold text-sunbiotan-100 md:px-6 ${i > 0 ? 'md:border-l md:border-sunbiotan-700' : ''}`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-sunbiotan-300" strokeWidth={1.75} aria-hidden="true" />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* 5. Vídeo — oscuro (gradiente) */}
        <section id="video" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.darkGradient}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader tone="dark" eyebrow={t('videoEyebrow')} lead={t('videoLead')} accent={t('videoAccent')} />
            <Reveal className="max-w-5xl mx-auto">
              <AutoplayVideo
                src={SHORT_VIDEO_SRC}
                clickHint={t('videoClickHint')}
                labels={{ mute: t('videoMute'), unmute: t('videoUnmute') }}
              />
              <div className="mt-6 flex justify-center">
                <Link
                  href="/video"
                  className="inline-flex items-center gap-2 text-sm tracking-[0.12em] uppercase font-semibold text-sunbiotan-200 hover:text-sunbiotan-50 underline underline-offset-4"
                >
                  <Play className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  {t('videoFull')}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 6. Rentabilidade — crema */}
        <section id="rentabilidade" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.cream}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader
              tone="light"
              eyebrow={t('profitEyebrow')}
              lead={t('profitLead')}
              accent={t('profitAccent')}
              intro={t('profitIntro')}
            />
            <Reveal className="max-w-6xl mx-auto mb-10">
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {business.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-sunbiotan-900">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-sunbiotan-700" strokeWidth={2.25} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {profit.map((f, i) => (
                <Reveal as="li" key={f.label} delay={i * 0.05} className="bg-white border border-sunbiotan-200 rounded-2xl p-6 text-center">
                  <span className="block font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-tight text-sunbiotan-900 mb-2">{f.value}</span>
                  <span className="block text-xs tracking-[0.1em] uppercase font-medium leading-snug text-sunbiotan-800">{f.label}</span>
                </Reveal>
              ))}
            </ul>
            <Reveal className="max-w-3xl mx-auto mt-8 rounded-2xl bg-sunbiotan-100 border border-sunbiotan-300 p-6">
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sunbiotan-800 mb-2">{t('profitExampleTitle')}</p>
              <p className="text-sm md:text-base leading-relaxed text-sunbiotan-900">{t('claims.profitExample')}</p>
              <p className="mt-3 text-xs leading-relaxed text-sunbiotan-800 italic">{t('claims.profitNote')}</p>
            </Reveal>
          </div>
        </section>

        {/* 7. FAQ — arena */}
        <section id="faq" className={`py-16 md:py-24 scroll-mt-16 md:scroll-mt-20 ${BG.sandDeep}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader tone="light" eyebrow={t('faqEyebrow')} lead={t('faqLead')} accent={t('faqAccent')} />
            <Reveal className="max-w-3xl mx-auto">
              <ul>
                {faq.map((item) => <FaqItem key={item.q} item={item} />)}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* 8. Cierre — oscuro (gradiente) */}
        <section id="proposta" className={`py-16 md:py-24 ${BG.darkGradient}`}>
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <SectionHeader
              tone="dark"
              eyebrow={t('closingEyebrow')}
              lead={t('closingLead')}
              accent={t('closingAccent')}
              intro={t('closingText')}
            />
            <Reveal className="flex flex-col items-center gap-6">
              <WhatsappCta href={whatsappUrl} label={t('closingCta')} />
              <p className="flex items-center gap-2 text-sm text-sunbiotan-200">
                <Phone className="h-4 w-4 text-sunbiotan-300" strokeWidth={1.75} aria-hidden="true" />
                {t('closingPhone')}:{' '}
                <PhoneLink display={CONTACT_PHONE.display} className="font-semibold text-sunbiotan-50" />
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <ProFooter />
    </>
  );
}

/** Pie compacto de la presentación: sin enlaces al portal ni a "Área Profissional". */
function ProFooter() {
  const t = useTranslations('Footer');
  return (
    <footer className="bg-sunbiotan-950 border-t border-sunbiotan-800 py-10">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-sunbiotan-300">
        <Image src="/images/logo-sunbiotan.jpg" alt="Sunbiotan" width={130} height={40} className="h-9 w-auto object-contain" />
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="mailto:info@sunbiotan.pt" className="hover:text-sunbiotan-100">info@sunbiotan.pt</a>
          <PhoneLink display={CONTACT_PHONE.display} className="hover:text-sunbiotan-100" />
          <Link href="/privacidade" className="hover:text-sunbiotan-100">{t('privacy')}</Link>
          <Link href="/cookies" className="hover:text-sunbiotan-100">{t('cookies')}</Link>
          <a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener noreferrer" className="hover:text-sunbiotan-100">
            {t('complaintsBook')}
          </a>
        </div>
      </div>
    </footer>
  );
}
