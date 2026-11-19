// GET /api/admin/contactos/exportar
// CSV de leads que aceptaron novedades (no pruebas, sin baja). Apto para Excel:
// BOM UTF-8, separador ";" y CRLF. Celdas que empiezan con = + - @ (o tab/CR)
// se prefijan con ' contra inyección de fórmulas.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { csvCell } from '@/lib/pro/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEP = ';';
const HEADER = ['email', 'nome', 'centro', 'localidade', 'idioma', 'data_consentimento'];

interface ExportRow {
  email: string;
  name: string;
  business_name: string;
  city: string;
  locale: string;
  marketing_consent_at: string | null;
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req, { origin: 'loose' });
  if (!gate.ok) return gate.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pro_leads')
    .select('email, name, business_name, city, locale, marketing_consent_at')
    .eq('marketing_consent', true)
    .eq('is_test', false)
    .is('marketing_unsubscribed_at', null)
    .order('marketing_consent_at', { ascending: false })
    .limit(10_000);
  if (error) return NextResponse.json({ error: 'load_failed' }, { status: 500 });

  const lines = [HEADER.map(csvCell).join(SEP)];
  for (const r of (data ?? []) as ExportRow[]) {
    lines.push(
      [
        r.email,
        r.name,
        r.business_name,
        r.city,
        r.locale.toUpperCase(),
        r.marketing_consent_at ? r.marketing_consent_at.slice(0, 10) : '',
      ].map(csvCell).join(SEP)
    );
  }
  const csv = `﻿${lines.join('\r\n')}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sunbiotan-contactos-${date}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
