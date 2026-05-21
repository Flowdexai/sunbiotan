// lib/data/centers-data.ts
import { createClient } from '@/lib/supabase/client';
import { Center } from '@/types/center';

export async function getCenters(): Promise<Center[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name');

  if (error) {
    console.error('Error loading centers:', error);
    return [];
  }

  return data || [];
}

export async function getCenterById(id: string): Promise<Center | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedCenters(): Promise<Center[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
    .order('name');

  if (error) return [];
  return data || [];
}

export async function searchCenters(query: string): Promise<Center[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('active', true)
    .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
    .order('featured', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getAllCities(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('city')
    .eq('active', true);

  if (error) return [];

  const cities = data.map((c: { city: string }) => c.city);
  return Array.from(new Set(cities)).sort();
}

