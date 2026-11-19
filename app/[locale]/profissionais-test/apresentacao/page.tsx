// Presentación reservada del flujo de PRUEBA. Dinámica: lee la cookie
// pro_access en el servidor; sin sesión válida redirige al formulario.
import type { Metadata } from 'next';
import { ProPresentationRoute } from '@/components/pro/pro-presentation-route';
import { proPresentationMetadata } from '@/components/pro/metadata';

export const dynamic = 'force-dynamic';

const FLOW = 'test' as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return proPresentationMetadata(locale);
}

export default async function ProfissionaisTestApresentacaoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ProPresentationRoute flow={FLOW} locale={locale} />;
}
