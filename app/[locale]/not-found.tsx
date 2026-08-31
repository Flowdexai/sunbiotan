import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function LocaleNotFound() {
  const t = useTranslations('NotFound');

  return (
    <>
      <Navbar forceOpaque />
      <main
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-24"
        style={{ background: 'linear-gradient(160deg, #0f0b06 0%, #1a130a 100%)' }}
      >
        <p className="font-display font-light text-7xl text-sunbiotan-700/40 mb-4">404</p>
        <h1 className="font-display font-light text-3xl text-sunbiotan-100 mb-3">{t('title')}</h1>
        <p className="text-sunbiotan-400/60 text-sm font-light max-w-sm mb-8">{t('description')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-sunbiotan-600/40 text-sunbiotan-200 hover:border-sunbiotan-400/60 text-[11px] tracking-[0.2em] uppercase font-light rounded-full transition-all duration-300 hover:bg-white/[0.03]"
        >
          {t('backHome')}
        </Link>
      </main>
      <Footer />
    </>
  );
}
