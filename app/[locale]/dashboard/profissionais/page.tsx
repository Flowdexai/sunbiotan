'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Users, Check, X, Loader2, Mail, Building2, Send, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { adminPost } from '@/lib/admin/client-api';

interface Professional {
  id: string;
  full_name: string | null;
  approved: boolean;
  created_at: string;
  center_id: string | null;
  email: string | null;
  password_set: boolean | null;
}

interface CenterOption {
  id: string;
  name: string;
  city: string;
}

type Flash = { type: 'ok' | 'warn' | 'error'; text: string } | null;

export default function ProfissionaisPage() {
  const t = useTranslations('DashboardProfissionais');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [flash, setFlash] = useState<Flash>(null);

  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  // El email sale de profiles.email (la API admin de Auth no funciona desde
  // el navegador). El centro se resuelve contra la lista de centers.
  const fetchAll = useCallback(async () => {
    const [{ data: profiles }, { data: ctrs }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, approved, created_at, center_id, email, password_set')
        .eq('role', 'professional')
        .order('created_at', { ascending: false }),
      supabase.from('centers').select('id, name, city').order('name'),
    ]);
    return { profiles: (profiles as Professional[]) ?? [], ctrs: (ctrs as CenterOption[]) ?? [] };
  }, [supabase]);

  const apply = useCallback((r: { profiles: Professional[]; ctrs: CenterOption[] }) => {
    setProfessionals(r.profiles);
    setCenters(r.ctrs);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchAll().then((r) => { if (active) apply(r); });
    return () => { active = false; };
  }, [fetchAll, apply]);

  const loadProfessionals = useCallback(async () => apply(await fetchAll()), [fetchAll, apply]);

  const centerById = useMemo(() => new Map(centers.map((c) => [c.id, c])), [centers]);

  async function toggleApproval(professional: Professional) {
    setUpdating(professional.id);
    setFlash(null);
    const { error } = await supabase.from('profiles').update({ approved: !professional.approved }).eq('id', professional.id);
    if (error) setFlash({ type: 'error', text: t('msgError') });
    await loadProfessionals();
    setUpdating(null);
  }

  async function changeCenter(professional: Professional, centerId: string) {
    setUpdating(professional.id);
    setFlash(null);
    // RLS + trigger: solo un admin puede cambiar center_id.
    const { error } = await supabase
      .from('profiles')
      .update({ center_id: centerId || null })
      .eq('id', professional.id);
    setFlash(error ? { type: 'error', text: t('msgError') } : { type: 'ok', text: t('msgCenterSaved') });
    await loadProfessionals();
    setUpdating(null);
  }

  async function resendAccess(professional: Professional) {
    setUpdating(professional.id);
    setFlash(null);
    const res = await adminPost(`/api/admin/profissionais/${professional.id}/resend`, {});
    if (!res.ok) setFlash({ type: 'error', text: t('msgError') });
    else if (res.data.emailSent === false) setFlash({ type: 'warn', text: t('msgResendFailed') });
    else setFlash({ type: 'ok', text: t('msgResent') });
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

      {flash && (
        <div
          role="status"
          className={`rounded-lg px-4 py-3 text-sm border ${
            flash.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800'
              : flash.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {flash.text}
        </div>
      )}

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
            {filtered.map((professional) => {
              const center = professional.center_id ? centerById.get(professional.center_id) : undefined;
              const isBusy = updating === professional.id;
              return (
                <div key={professional.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4 hover:bg-sunbiotan-50/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunbiotan-200 to-sunbiotan-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-sunbiotan-700 text-sm font-medium">
                        {professional.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-sunbiotan-900">
                        {professional.full_name || t('noName')}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        {professional.email && (
                          <span className="flex items-center gap-1 text-xs text-sunbiotan-500 break-all">
                            <Mail className="h-3 w-3" />{professional.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-sunbiotan-500">
                          <Building2 className="h-3 w-3" />
                          {center ? `${center.name} · ${center.city}` : t('noCenter')}
                        </span>
                        {professional.password_set === false && (
                          <span className="flex items-center gap-1 text-xs text-amber-700">
                            <KeyRound className="h-3 w-3" />{t('awaitingPassword')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sunbiotan-400 mt-0.5">
                        {t('registeredOn')} {new Date(professional.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="sr-only" htmlFor={`center-${professional.id}`}>{t('centerLabel')}</label>
                    <select
                      id={`center-${professional.id}`}
                      value={professional.center_id ?? ''}
                      onChange={(e) => changeCenter(professional, e.target.value)}
                      disabled={isBusy}
                      className="max-w-[16rem] px-3 py-1.5 bg-white border border-sunbiotan-200 rounded-lg text-xs text-sunbiotan-800 disabled:opacity-60"
                    >
                      <option value="">{t('noCenter')}</option>
                      {centers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} · {c.city}</option>
                      ))}
                    </select>

                    {professional.password_set === false && (
                      <button
                        onClick={() => resendAccess(professional)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100 disabled:opacity-60"
                      >
                        <Send className="h-3.5 w-3.5" />{t('resendAccess')}
                      </button>
                    )}

                    <span className={`text-xs px-2.5 py-1 rounded-full ${professional.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {professional.approved ? t('statusApproved') : t('statusPending')}
                    </span>
                    <button
                      onClick={() => toggleApproval(professional)}
                      disabled={isBusy}
                      aria-label={professional.approved ? t('statusPending') : t('statusApproved')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${professional.approved ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : professional.approved ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
