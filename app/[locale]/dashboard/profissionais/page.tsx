'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Users, Check, X, Loader2, Mail, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Professional {
  id: string;
  full_name: string;
  approved: boolean;
  created_at: string;
  center_id: string | null;
  email?: string;
  center?: { name: string; city: string };
}

export default function ProfissionaisPage() {
  const t = useTranslations('DashboardProfissionais');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProfessionals();
  }, []);

  async function loadProfessionals() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`id, full_name, approved, created_at, center_id, centers ( name, city )`)
      .eq('role', 'professional')
      .order('created_at', { ascending: false });

    if (!profiles) return;

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const { data: userData } = await supabase.auth.admin?.getUserById?.(p.id) ?? { data: null };
        return {
          ...p,
          email: userData?.user?.email,
          center: Array.isArray(p.centers) ? p.centers[0] : p.centers,
        };
      })
    );

    setProfessionals(enriched as Professional[]);
    setLoading(false);
  }

  async function toggleApproval(professional: Professional) {
    setUpdating(professional.id);
    await supabase.from('profiles').update({ approved: !professional.approved }).eq('id', professional.id);
    await loadProfessionals();
    setUpdating(null);
  }

  const filtered = professionals.filter((p) => {
    if (filter === 'pending') return !p.approved;
    if (filter === 'approved') return p.approved;
    return true;
  });

  const pendingCount = professionals.filter((p) => !p.approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('title')}</h1>
        <p className="text-sunbiotan-600 text-sm font-light">
          {t('count', { count: professionals.length })}
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              {t('pendingBadge', { count: pendingCount })}
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-sunbiotan-500 text-white' : 'bg-white border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50'}`}
          >
            {f === 'all' ? t('filterAll') : f === 'pending' ? t('filterPending') : t('filterApproved')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-sunbiotan-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sunbiotan-500">
            <Users className="h-10 w-10 mx-auto mb-3 text-sunbiotan-300" />
            <p className="text-sm">{t('notFound')}</p>
          </div>
        ) : (
          <div className="divide-y divide-sunbiotan-50">
            {filtered.map((professional) => (
              <div key={professional.id} className="flex items-center justify-between px-6 py-4 hover:bg-sunbiotan-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunbiotan-200 to-sunbiotan-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-sunbiotan-700 text-sm font-medium">
                      {professional.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sunbiotan-900">
                      {professional.full_name || t('noName')}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {professional.email && (
                        <span className="flex items-center gap-1 text-xs text-sunbiotan-500">
                          <Mail className="h-3 w-3" />{professional.email}
                        </span>
                      )}
                      {professional.center && (
                        <span className="flex items-center gap-1 text-xs text-sunbiotan-500">
                          <Building2 className="h-3 w-3" />
                          {professional.center.name} · {professional.center.city}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sunbiotan-400 mt-0.5">
                      {t('registeredOn')} {new Date(professional.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${professional.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {professional.approved ? t('statusApproved') : t('statusPending')}
                  </span>
                  <button
                    onClick={() => toggleApproval(professional)}
                    disabled={updating === professional.id}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${professional.approved ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                  >
                    {updating === professional.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : professional.approved ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
