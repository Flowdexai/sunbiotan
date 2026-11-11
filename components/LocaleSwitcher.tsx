'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  pt: 'PT',
  es: 'ES',
  en: 'EN',
  it: 'IT',
  fr: 'FR',
};

interface LocaleSwitcherProps {
  /** `inline`: all locales side by side (desktop). `compact`: pill with the current locale that opens a menu (mobile). */
  variant?: 'inline' | 'compact';
}

export function LocaleSwitcher({ variant = 'inline' }: LocaleSwitcherProps) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function handleChange(next: string) {
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (variant === 'compact') {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t('label')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sunbiotan-50 text-sunbiotan-950 text-xs font-semibold tracking-[0.12em] transition-colors hover:bg-white"
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>

        {open && (
          <ul
            role="menu"
            className="absolute right-0 top-full mt-2 min-w-[4.5rem] py-1.5 rounded-xl bg-[#1a130a]/97 backdrop-blur-xl border border-sunbiotan-700/40 shadow-2xl z-[60]"
          >
            {routing.locales.map((l) => (
              <li key={l} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleChange(l)}
                  aria-current={l === locale ? 'true' : undefined}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold tracking-[0.14em] transition-colors ${
                    l === locale ? 'text-sunbiotan-300' : 'text-sunbiotan-50 hover:text-sunbiotan-300'
                  }`}
                >
                  {LOCALE_LABELS[l] ?? l.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" aria-label={t('label')}>
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`text-[11px] tracking-[0.12em] font-medium px-1.5 py-0.5 rounded transition-colors duration-200 ${
            l === locale
              ? 'text-sunbiotan-950 bg-sunbiotan-100'
              : 'text-sunbiotan-200 hover:text-white'
          }`}
          aria-current={l === locale ? 'true' : undefined}
        >
          {LOCALE_LABELS[l] ?? l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
