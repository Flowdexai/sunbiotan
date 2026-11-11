import { NextResponse } from 'next/server';
import { getClientIp, isSameOriginLoose } from '@/lib/http/request';
import { rateLimit } from '@/lib/rate-limit';

const MAX_ADDRESS_LENGTH = 200;

// Proxy a Google Geocoding (la key no sale del servidor). Hoy lo llama el alta
// de centros del dashboard (dashboard/centros/nuevo); el buscador del mapa usa
// Places directamente en el navegador.
export async function GET(req: Request) {
  if (!isSameOriginLoose(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (ip) {
    const rl = rateLimit(`geocode:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address')?.trim();

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }
  if (address.length > MAX_ADDRESS_LENGTH) {
    return NextResponse.json({ error: 'address too long' }, { status: 400 });
  }

  const key = process.env.GOOGLE_GEOCODING_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Geocoding not configured' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  let data: { status?: string; results?: { geometry: { location: { lat: number; lng: number } } }[] };
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  if (data.status !== 'OK' || !data.results?.length) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { lat, lng } = data.results[0].geometry.location;
  return NextResponse.json(
    { lat, lng },
    { headers: { 'Cache-Control': 'private, max-age=300' } }
  );
}
