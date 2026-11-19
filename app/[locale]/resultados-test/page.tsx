// Ruta de PRUEBA de la página de resultados (vídeos + fotos).
// Wrapper fino: todo vive en components/results/*. noindex, fuera del sitemap,
// sin canonical/hreflang y sin enlaces desde el sitio. Base en lib/results/config.ts.
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ResultsPage } from '@/components/results/results-page';
import { resultsMetadata } from '@/components/results/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return resultsMetadata(locale);
}

export default function ResultadosTestPage() {
  return (
    <>
      <Navbar forceOpaque />
      <ResultsPage />
      <Footer />
    </>
  );
}
