import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = 'portal-resources';
const SIGNED_URL_TTL_SECONDS = 60;

// Toda apertura de recursos del portal pasa por aquí. El storage_path nunca
// llega al cliente y las URLs firmadas no se guardan: se generan al vuelo
// (60 s) y se redirige.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // RLS: solo profesionales aprobados o admin leen resources.
  const { data: resource } = await supabase
    .from('resources')
    .select('id, url, storage_path, active')
    .eq('id', id)
    .maybeSingle();
  if (!resource || resource.active === false) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const noStore = { 'Cache-Control': 'private, no-store' };

  if (resource.storage_path) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(resource.storage_path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'unavailable' }, { status: 404 });
    }
    return NextResponse.redirect(data.signedUrl, { status: 302, headers: noStore });
  }

  if (resource.url) {
    try {
      const target = new URL(resource.url);
      if (target.protocol === 'http:' || target.protocol === 'https:') {
        return NextResponse.redirect(target.toString(), { status: 302, headers: noStore });
      }
    } catch {
      /* URL inválida: cae al 404 */
    }
  }

  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}
