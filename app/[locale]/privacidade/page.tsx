import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/navigation';
import { MapPin } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PrivacidadePage' });
  return {
    title: `${t('title')} | Sunbiotan`,
    robots: { index: false },
  };
}

export default async function PrivacidadePage() {
  const t = await getTranslations('PrivacidadePage');

  return (
    <>
      <Navbar forceOpaque />
      <main className="bg-sunbiotan-950 min-h-screen pt-28 pb-24">
        {/* Header */}
        <div className="container mx-auto px-6 mb-14">
          <div className="max-w-3xl">
            <p className="text-[10px] tracking-[0.35em] uppercase text-sunbiotan-600/70 mb-4 font-medium">
              Legal
            </p>
            <h1 className="font-display font-light text-3xl md:text-4xl text-sunbiotan-100/90 mb-3">
              {t('title')}
            </h1>
            <p className="text-xs text-sunbiotan-600/60 font-light tracking-wide">
              {t('lastUpdated')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="container mx-auto px-6 mb-12">
          <div className="h-px bg-gradient-to-r from-sunbiotan-800/40 via-sunbiotan-700/20 to-transparent max-w-3xl" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6">
          <div className="max-w-3xl space-y-12">

            {/* Intro */}
            <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
              {t('intro')}
            </p>

            {/* Section 1 — Responsável */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-5">
                {t('s1Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-4">
                {t('s1Text')}
              </p>
              <div className="border border-sunbiotan-800/40 rounded-xl px-5 py-4 space-y-2">
                <p className="text-sm font-medium text-sunbiotan-300/80">{t('s1Name')}</p>
                <a href={`mailto:${t('s1Email')}`} className="block text-sm text-sunbiotan-500 hover:text-sunbiotan-400 font-light transition-colors underline underline-offset-2">
                  {t('s1Email')}
                </a>
                <p className="text-sm text-sunbiotan-500/60 font-light">{t('s1Phone')}</p>
              </div>
            </section>

            {/* Section 2 — Dados Recolhidos */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s2Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-6">
                {t('s2Intro')}
              </p>
              <div className="space-y-5">
                {/* Contact form */}
                <div className="border-l-2 border-sunbiotan-700/40 pl-5">
                  <h3 className="text-sm font-medium text-sunbiotan-300/80 mb-1.5">
                    {t('s2Item1Title')}
                  </h3>
                  <p className="text-sm text-sunbiotan-500/60 font-light leading-relaxed">
                    {t('s2Item1Text')}
                  </p>
                </div>
                {/* Professional form */}
                <div className="border-l-2 border-sunbiotan-700/40 pl-5">
                  <h3 className="text-sm font-medium text-sunbiotan-300/80 mb-1.5">
                    {t('s2Item2Title')}
                  </h3>
                  <p className="text-sm text-sunbiotan-500/60 font-light leading-relaxed">
                    {t('s2Item2Text')}
                  </p>
                </div>
                {/* Geolocation — highlighted */}
                <div className="border border-sunbiotan-700/30 rounded-xl p-5 bg-sunbiotan-900/20">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-sunbiotan-500/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-sm font-medium text-sunbiotan-300/80 mb-2">
                        {t('s2Item3Title')}
                      </h3>
                      <p className="text-sm text-sunbiotan-500/60 font-light leading-relaxed">
                        {t('s2Item3Text')}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Cookies */}
                <div className="border-l-2 border-sunbiotan-700/40 pl-5">
                  <h3 className="text-sm font-medium text-sunbiotan-300/80 mb-1.5">
                    {t('s2Item4Title')}
                  </h3>
                  <p className="text-sm text-sunbiotan-500/60 font-light leading-relaxed">
                    {t('s2Item4Text')}{' '}
                    <Link href="/cookies" className="text-sunbiotan-400 hover:text-sunbiotan-300 underline underline-offset-2 transition-colors">
                      {t('s2Item4Link')}
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 — Finalidades */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s3Title')}
              </h2>
              <ul className="space-y-3">
                {[t('s3Item1'), t('s3Item2'), t('s3Item3'), t('s3Item4')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                    <span className="text-sunbiotan-600/60 flex-shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 — Conservação */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s4Title')}
              </h2>
              <ul className="space-y-3">
                {[t('s4Item1'), t('s4Item2'), t('s4Item3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                    <span className="text-sunbiotan-600/60 flex-shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 5 — Direitos */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s5Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-5">
                {t('s5Intro')}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[t('s5Right1'), t('s5Right2'), t('s5Right3'), t('s5Right4'), t('s5Right5'), t('s5Right6')].map((right, i) => (
                  <div key={i} className="border border-sunbiotan-800/30 rounded-lg px-4 py-3">
                    <p className="text-xs text-sunbiotan-400/65 font-light leading-relaxed">{right}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed pl-1 border-l border-sunbiotan-700/30">
                {t('s5HowTo')}
              </p>
            </section>

            {/* Section 6 — Transferências */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s6Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                {t('s6Text')}
              </p>
            </section>

            {/* Section 7 — Alterações */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s7Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                {t('s7Text')}
              </p>
            </section>

            {/* Section 8 — Contacto & CNPD */}
            <section className="border border-sunbiotan-800/35 rounded-xl px-6 py-6 space-y-4">
              <h2 className="font-display font-light text-lg text-sunbiotan-200/80">
                {t('s8Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                {t('s8Text')}
              </p>
              <a href={`mailto:${t('s8Email')}`} className="block text-sm text-sunbiotan-400 hover:text-sunbiotan-300 font-light transition-colors underline underline-offset-2">
                {t('s8Email')}
              </a>
              <div className="pt-2 border-t border-sunbiotan-800/25">
                <p className="text-sm text-sunbiotan-500/60 font-light leading-relaxed mb-2">
                  {t('s8CNPDText')}
                </p>
                <p className="text-sm text-sunbiotan-400/70 font-light">{t('s8CNPDName')}</p>
                <a
                  href={t('s8CNPDLink')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sunbiotan-500 hover:text-sunbiotan-400 font-light transition-colors underline underline-offset-2"
                >
                  {t('s8CNPDWebsite')}
                </a>
              </div>
            </section>

            {/* Back link */}
            <div className="pt-4">
              <Link
                href="/"
                className="text-xs tracking-[0.2em] uppercase text-sunbiotan-600/55 hover:text-sunbiotan-400 font-light transition-colors duration-300"
              >
                ← {t('backHome')}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
