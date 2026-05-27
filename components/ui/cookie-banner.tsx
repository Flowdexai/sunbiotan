'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function CookieBanner() {
  const t = useTranslations('CookieBanner');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) setVisible(true);
    } catch {
      // localStorage not available
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem('cookie-consent', 'accepted'); } catch {}
    setVisible(false);
  };

  const handleReject = () => {
    try { localStorage.setItem('cookie-consent', 'rejected'); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-2xl"
          role="dialog"
          aria-label="Consentimento de cookies"
        >
          <div className="bg-[#1a130a]/98 backdrop-blur-2xl border border-sunbiotan-800/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] px-5 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
              {/* Text */}
              <p className="flex-1 text-[12px] leading-relaxed text-sunbiotan-400/70 font-light min-w-0">
                {t('description')}{' '}
                <Link
                  href="/cookies"
                  className="text-sunbiotan-400 hover:text-sunbiotan-300 underline underline-offset-2 transition-colors duration-200 whitespace-nowrap"
                >
                  {t('learnMore')}
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                <button
                  onClick={handleReject}
                  className="px-4 py-1.5 text-[11px] tracking-[0.14em] uppercase font-light text-sunbiotan-500/60 border border-sunbiotan-800/50 rounded-full hover:border-sunbiotan-700/70 hover:text-sunbiotan-400/80 transition-all duration-300"
                >
                  {t('reject')}
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-1.5 text-[11px] tracking-[0.14em] uppercase font-medium text-white bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 rounded-full transition-all duration-300 shadow-lg shadow-sunbiotan-900/40"
                >
                  {t('accept')}
                </button>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
