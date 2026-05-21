'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';

const WA_NUMBER = '351920253796';

export function WhatsAppButton() {
  const t = useTranslations('WhatsApp');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <m.a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t('message'))}`}
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
