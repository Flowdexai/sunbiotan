// Ruta de PRUEBA del flujo profesional (formulario → presentación).
// Wrapper fino: todo vive en components/pro/*. noindex, fuera del sitemap,
// sin canonical/hreflang y sin enlaces desde el sitio.
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProLanding } from '@/components/pro/pro-landing';
import { proLandingMetadata } from '@/components/pro/metadata';

const FLOW = 'test' as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return proLandingMetadata(locale, FLOW);
}

export default function ProfissionaisTestPage() {
  return (
    <>
      <Navbar />
      <ProLanding flow={FLOW} />
      <Footer />
    </>
  );
}
