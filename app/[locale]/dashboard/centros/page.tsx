'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Search,
  MapPin,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from 'lucide-react';
import { Center } from '@/types/center';

export default function CentrosAdminPage() {
  const t = useTranslations('DashboardCentros');
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadCenters();
  }, []);

  async function loadCenters() {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .order('featured', { ascending: false })
      .order('name');

    if (!error && data) setCenters(data);
    setLoading(false);
  }

  async function toggleFeatured(center: Center) {
    setUpdating(center.id);
    await supabase.from('centers').update({ featured: !center.featured }).eq('id', center.id);
    await loadCenters();
    setUpdating(null);
  }

  async function toggleActive(center: Center) {
    setUpdating(center.id);
    await supabase.from('centers').update({ active: !center.active }).eq('id', center.id);
    await loadCenters();
    setUpdating(null);
  }

  const filtered = centers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            {t('title')}
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">
            {t('count', { count: centers.length })}
          </p>
        </div>
        <Link
          href="/dashboard/centros/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20"
        >
          <Plus className="h-4 w-4" />
          {t('newCenter')}
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sunbiotan-400" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
        />
      </div>

      <div className="bg-white rounded-xl border border-sunbiotan-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sunbiotan-100 bg-sunbiotan-50/50">
                <th className="text-left px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colCenter')}</th>
                <th className="text-left px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colCity')}</th>
                <th className="text-left px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colCountry')}</th>
                <th className="text-center px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colFeatured')}</th>
                <th className="text-center px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colActive')}</th>
                <th className="text-center px-6 py-4 text-xs tracking-[0.15em] uppercase text-sunbiotan-600 font-medium">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sunbiotan-50">
              {filtered.map((center) => (
                <tr key={center.id} className="hover:bg-sunbiotan-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sunbiotan-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-sunbiotan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-sunbiotan-900">{center.name}</p>
                        {center.instagram && (
                          <p className="text-xs text-sunbiotan-500">@{center.instagram}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-sunbiotan-700">{center.city}</td>
                  <td className="px-6 py-4 text-sm text-sunbiotan-700">{center.country}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(center)}
                      disabled={updating === center.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sunbiotan-100 transition-colors disabled:opacity-50"
                    >
                      {updating === center.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-sunbiotan-500" />
                      ) : center.featured ? (
                        <Star className="h-4 w-4 text-sunbiotan-500 fill-sunbiotan-500" />
                      ) : (
                        <StarOff className="h-4 w-4 text-sunbiotan-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(center)}
                      disabled={updating === center.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sunbiotan-100 transition-colors disabled:opacity-50"
                    >
                      {updating === center.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-sunbiotan-500" />
                      ) : center.active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/dashboard/centros/${center.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sunbiotan-100 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-sunbiotan-500" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sunbiotan-500">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-sunbiotan-300" />
              <p className="text-sm">{t('notFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
