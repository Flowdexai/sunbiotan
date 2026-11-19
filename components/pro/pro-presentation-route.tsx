// Servidor de la presentación reservada: valida la cookie `pro_access`, lee
// el lead con service role y, si algo no cierra, redirige al formulario.
import 'server-only';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeLocale } from '@/lib/auth/links';
import { whatsappHref } from '@/lib/contact';
import { proBase, type ProFlow } from '@/lib/pro/config';
import { PRO_COOKIE, readProSession, sessionFlow } from '@/lib/pro/session';
import { ProPresentation } from './pro-presentation';

interface LeadRow {
  name: string;
  business_name: string;
  locale: string;
  is_test: boolean;
}

async function loadLead(id: string): Promise<LeadRow | null> {
  try {
    const { data, error } = await createAdminClient()
      .from('pro_leads')
      .select('name, business_name, locale, is_test')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[pro-apresentacao] lectura del lead falló:', error.code ?? 'unknown');
      return null;
    }
    return (data as LeadRow | null) ?? null;
  } catch {
    console.error('[pro-apresentacao] cliente admin no configurado');
    return null;
  }
}

export async function ProPresentationRoute({ flow, locale }: { flow: ProFlow; locale: string }) {
  // Sin acceso → al formulario del mismo flow, con la línea "?acesso=1".
  const back = (): never => redirect({ href: `${proBase(flow)}?acesso=1#formulario`, locale });

  const store = await cookies();
  const session = readProSession(store.get(PRO_COOKIE)?.value);
  if (!session || sessionFlow(session) !== flow) return back();

  const lead = await loadLead(session.leadId);
  if (!lead || lead.is_test !== session.isTest) return back();

  // Mensaje de WhatsApp en el idioma del lead (no necesariamente el de la página).
  const tLead = await getTranslations({ locale: normalizeLocale(lead.locale), namespace: 'ProPresentation' });
  const message = tLead('whatsappMessage', { name: lead.name, business: lead.business_name });
  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name;

  return <ProPresentation firstName={firstName} whatsappUrl={whatsappHref(message)} flow={flow} />;
}
