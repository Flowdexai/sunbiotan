'use client';

// Navbar de la presentación profesional: logo, anclas a las secciones,
// selector de idioma (la cookie pro_access tiene Path=/, así que se mantiene)
// y CTA "Receber a proposta" rastreado. Sin Login ni "Área Profissional".

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { trackWhatsappInterest } from './track';

export const PRO_SECTIONS = ['tratamento', 'comparativo', 'sistema', 'rentabilidade', 'faq'] as const;
const LABEL_KEYS = {
  tratamento: 'navTreatment',
  comparativo: 'navComparison',
  sistema: 'navSystem',
  rentabilidade: 'navProfit',
  faq: 'navFaq',
} as const;

/** `tracked` = hay lead: el clic del CTA se registra. Sin lead (prueba abierta) no se llama a la API. */
export function ProNavbar({ whatsappUrl, tracked = true }: { whatsappUrl: string; tracked?: boolean }) {
  const t = useTranslations('ProPresentation');
  const [open, setOpen] = useState(false);

  const cta = (className: string) => (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => { if (tracked) trackWhatsappInterest(); setOpen(false); }}
      className={`cursor-pointer ${className}`}
    >
      <FontAwesomeIcon icon={faWhatsapp} style={{ width: '15px', height: '15px' }} aria-hidden="true" />
      {t('navCta')}
    </a>
  );

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-sunbiotan-950/95 backdrop-blur-xl border-b border-sunbiotan-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            <a href="#inicio" className="shrink-0" aria-label="Sun BioTan®">
              <Image src="/images/logo-sunbiotan.jpg" alt="Sunbiotan" width={150} height={46} className="h-9 md:h-10 w-auto object-contain" priority />
            </a>

            <div className="hidden lg:flex items-center gap-7">
              {PRO_SECTIONS.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-[11px] tracking-[0.22em] uppercase font-medium text-sunbiotan-50 hover:text-sunbiotan-300 transition-colors"
                >
                  {t(LABEL_KEYS[id])}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex [&_button]:cursor-pointer"><LocaleSwitcher /></div>
              {cta('inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] text-sunbiotan-950 text-[11px] tracking-[0.16em] uppercase font-bold rounded-full transition-all duration-300 hover:scale-105')}
            </div>

            <div className="lg:hidden flex items-center gap-3">
              <div className="flex [&_button]:cursor-pointer"><LocaleSwitcher variant="compact" /></div>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="cursor-pointer text-sunbiotan-50 hover:text-sunbiotan-300 transition-colors p-1"
                aria-label={t('navMenu')}
                aria-expanded={open}
                aria-controls="pro-mobile-menu"
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="pro-mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-16 inset-x-0 z-40 bg-sunbiotan-950 border-b border-sunbiotan-800 shadow-2xl"
          >
            <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
              {PRO_SECTIONS.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="text-sm tracking-[0.2em] uppercase font-medium text-sunbiotan-50 hover:text-sunbiotan-300"
                >
                  {t(LABEL_KEYS[id])}
                </a>
              ))}
              {cta('mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 text-sunbiotan-950 text-xs tracking-[0.16em] uppercase font-bold rounded-full')}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
