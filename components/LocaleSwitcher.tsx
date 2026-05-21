'use client';

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

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1" aria-label={t('label')}>
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className={`text-[10px] tracking-[0.12em] font-medium px-1.5 py-0.5 rounded transition-colors duration-200 ${
            l === locale
              ? 'text-sunbiotan-700 bg-sunbiotan-100'
              : 'text-sunbiotan-400 hover:text-sunbiotan-600'
          }`}
          aria-current={l === locale ? 'true' : undefined}
        >
          {LOCALE_LABELS[l] ?? l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
