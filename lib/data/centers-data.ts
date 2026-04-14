// lib/data/centers-data.ts

import centersJson from '@/data/centers.json';
import { Center } from '@/types/center';

// Simula delay de API (para que se sienta más real)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCenters(): Promise<Center[]> {
  await delay(300);
  return centersJson as Center[];
}

export async function getCenterById(id: string): Promise<Center | null> {
  await delay(200);
  const center = centersJson.find((c) => c.id === id);
  return center ? (center as Center) : null;
}

export async function getCentersByCity(city: string): Promise<Center[]> {
  await delay(300);
  return centersJson.filter((c) => c.city === city) as Center[];
}

export async function getFeaturedCenters(): Promise<Center[]> {
  await delay(300);
  return centersJson.filter((c) => c.featured) as Center[];
}

export async function searchCenters(query: string): Promise<Center[]> {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return centersJson.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.city.toLowerCase().includes(lowerQuery) ||
      c.address.toLowerCase().includes(lowerQuery)
  ) as Center[];
}

export function getAllCities(): string[] {
  const cities = centersJson.map((c) => c.city);
  return Array.from(new Set(cities)).sort();
}