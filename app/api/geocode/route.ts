import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const key = process.env.GOOGLE_GEOCODING_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Geocoding not configured' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { lat, lng } = data.results[0].geometry.location;
  return NextResponse.json({ lat, lng });
}
