import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import Script from 'next/script';
import { routing } from '@/i18n/routing';
import { buildAlternates, localizedHref } from '@/lib/seo';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { MotionProvider } from '@/components/motion-provider';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const OG_LOCALES: Record<string, string> = {
  pt: 'pt_PT',
  es: 'es_ES',
  en: 'en_US',
  it: 'it_IT',
  fr: 'fr_FR',
};

const HTML_LANG: Record<string, string> = {
  pt: 'pt-PT',
  es: 'es-ES',
  en: 'en',
  it: 'it-IT',
  fr: 'fr-FR',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    metadataBase: new URL('https://sunbiotan.pt'),
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    alternates: buildAlternates(locale),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: localizedHref(locale),
      locale: OG_LOCALES[locale] ?? 'en_US',
      images: [{ url: '/images/logo-sunbiotan.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/images/logo-sunbiotan.jpg'],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Unknown locale prefixes fall through to the top-level app/not-found.tsx.
export const dynamicParams = false;

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sunbiotan',
  url: 'https://sunbiotan.pt',
  logo: 'https://sunbiotan.pt/images/logo-sunbiotan.jpg',
  email: 'info@sunbiotan.pt',
  telephone: '+351920253796',
  areaServed: 'Europe',
  sameAs: [
    'https://instagram.com/sunbiotan',
    'https://www.facebook.com/sunbiotan.eu',
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={HTML_LANG[locale] ?? locale} className="scroll-smooth">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionProvider>
            {children}
            <WhatsAppButton />
            <CookieBanner />
          </MotionProvider>
        </NextIntlClientProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C1R1VVSYX7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C1R1VVSYX7');
            gtag('config', 'AW-18244892935');
          `}
        </Script>
      </body>
    </html>
  );
}
