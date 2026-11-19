'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { whatsappHref } from '@/lib/contact';
import { PRO_PRESENTATION_SEGMENT } from '@/lib/pro/config';

export function WhatsAppButton() {
  const t = useTranslations('WhatsApp');
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // La presentación profesional tiene sus propios CTAs de WhatsApp (rastreados).
  if (pathname.endsWith(PRO_PRESENTATION_SEGMENT)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <m.a
          href={whatsappHref(t('message'))}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-xl hover:scale-110 transition-all duration-300"
          aria-label={t('ariaLabel')}
        >
          <FontAwesomeIcon icon={faWhatsapp} style={{ width: '28px', height: '28px' }} className="text-white" />
        </m.a>
      )}
    </AnimatePresence>
  );
}
