import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CookiesPage' });
  return {
    title: `${t('title')} | Sunbiotan`,
    robots: { index: false },
  };
}

export default async function CookiesPage() {
  const t = await getTranslations('CookiesPage');

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

            {/* Section 1 */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s1Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                {t('s1Text')}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s2Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-6">
                {t('s2Intro')}
              </p>

              <div className="border border-sunbiotan-800/40 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-sunbiotan-900/30 border-b border-sunbiotan-800/30">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-sunbiotan-500/80 font-medium">
                    {t('s2EssentialTitle')}
                  </p>
                </div>
                <div className="divide-y divide-sunbiotan-800/20">
                  {/* Cookie 1 */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-medium text-sunbiotan-300/80 mb-1 font-mono">
                      {t('s2Cookie1Name')}
                    </p>
                    <p className="text-xs text-sunbiotan-500/60 font-light leading-relaxed">
                      {t('s2Cookie1Purpose')}
                    </p>
                    <p className="text-[11px] text-sunbiotan-600/55 font-light mt-1 italic">
                      {t('s2Cookie1Duration')}
                    </p>
                  </div>
                  {/* Cookie 2 */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-medium text-sunbiotan-300/80 mb-1 font-mono">
                      {t('s2Cookie2Name')}
                    </p>
                    <p className="text-xs text-sunbiotan-500/60 font-light leading-relaxed">
                      {t('s2Cookie2Purpose')}
                    </p>
                    <p className="text-[11px] text-sunbiotan-600/55 font-light mt-1 italic">
                      {t('s2Cookie2Duration')}
                    </p>
                  </div>
                  {/* Cookie 3 */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-medium text-sunbiotan-300/80 mb-1 font-mono">
                      {t('s2Cookie3Name')}
                    </p>
                    <p className="text-xs text-sunbiotan-500/60 font-light leading-relaxed">
                      {t('s2Cookie3Purpose')}
                    </p>
                    <p className="text-[11px] text-sunbiotan-600/55 font-light mt-1 italic">
                      {t('s2Cookie3Duration')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-sunbiotan-500/50 font-light leading-relaxed mt-4 pl-1 border-l border-sunbiotan-700/30 ml-0.5">
                {t('s2Note')}
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s3Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-4">
                {t('s3Text')}
              </p>
              <p className="text-sm text-sunbiotan-400/65 font-light mb-3">
                {t('s3Links')}
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  { label: t('s3Chrome'), href: 'https://support.google.com/chrome/answer/95647' },
                  { label: t('s3Firefox'), href: 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer' },
                  { label: t('s3Safari'), href: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
                  { label: t('s3Edge'), href: 'https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sunbiotan-500 hover:text-sunbiotan-400 font-light transition-colors duration-200 underline underline-offset-2"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-display font-light text-xl text-sunbiotan-200/80 mb-4">
                {t('s4Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed">
                {t('s4Text')}
              </p>
            </section>

            {/* Section 5 — Contact */}
            <section className="border border-sunbiotan-800/35 rounded-xl px-6 py-6">
              <h2 className="font-display font-light text-lg text-sunbiotan-200/80 mb-3">
                {t('s5Title')}
              </h2>
              <p className="text-sm text-sunbiotan-400/65 font-light leading-relaxed mb-3">
                {t('s5Text')}
              </p>
              <a
                href={`mailto:${t('s5Email')}`}
                className="text-sm text-sunbiotan-400 hover:text-sunbiotan-300 font-light transition-colors duration-200 underline underline-offset-2"
              >
                {t('s5Email')}
              </a>
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
