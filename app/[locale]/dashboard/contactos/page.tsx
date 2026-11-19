'use client';

// Dashboard → Contactos: leads del flujo profesional (pro_leads).
// Lectura con la sesión del admin (RLS: solo admin). Acciones vía
// /api/admin/contactos/* (requireAdmin + service role).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import {
  Loader2, Download, Mail, Phone, Globe, Trash2, Send, MapPin, Building2, Users, Eye, MessageCircle, BellRing,
} from 'lucide-react';
import { adminPost } from '@/lib/admin/client-api';
import { isActivityType } from '@/lib/partners/activity';
import { instagramHref, telHref, websiteHref } from '@/lib/partners/website';

interface Lead {
  id: string;
  is_test: boolean;
  name: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  activity_type: string;
  website_or_instagram: string | null;
  no_instagram: boolean;
  locale: string;
  marketing_consent: boolean;
  marketing_unsubscribed_at: string | null;
  access_count: number;
  view_count: number;
  last_viewed_at: string | null;
  whatsapp_clicks: number;
  notify_email_status: string | null;
  notify_email_error: string | null;
  notify_telegram_status: string | null;
  notify_telegram_error: string | null;
  created_at: string;
}

type Filter = 'all' | 'wants' | 'marketing';
type Flash = { type: 'ok' | 'warn' | 'error'; text: string } | null;

const PAGE = 5;
const EXPORT_URL = '/api/admin/contactos/exportar';
const COLUMNS =
  'id, is_test, name, business_name, city, phone, email, activity_type, website_or_instagram, no_instagram, locale, marketing_consent, marketing_unsubscribed_at, access_count, view_count, last_viewed_at, whatsapp_clicks, notify_email_status, notify_email_error, notify_telegram_status, notify_telegram_error, created_at';

const wants = (l: Lead) => l.whatsapp_clicks > 0;
const acceptsNews = (l: Lead) => l.marketing_consent && !l.marketing_unsubscribed_at;

export default function ContactosPage() {
  const t = useTranslations('DashboardContactos');
  const tAct = useTranslations('ProLanding');

  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [includeTests, setIncludeTests] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmTests, setConfirmTests] = useState(false);

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('pro_leads')
      .select(COLUMNS)
      .order('created_at', { ascending: false })
      .limit(2000);
    return (data as Lead[] | null) ?? [];
  }, [supabase]);

  useEffect(() => {
    let active = true;
    fetchAll().then((r) => {
      if (!active) return;
      setRows(r);
      setLoading(false);
    });
    return () => { active = false; };
  }, [fetchAll]);

  const reload = useCallback(async () => setRows(await fetchAll()), [fetchAll]);

  const scoped = useMemo(() => rows.filter((r) => includeTests || !r.is_test), [rows, includeTests]);
  const summary = useMemo(() => ({
    total: scoped.length,
    viewed: scoped.filter((r) => r.view_count > 0).length,
    wants: scoped.filter(wants).length,
    marketing: scoped.filter(acceptsNews).length,
  }), [scoped]);
  const filtered = useMemo(
    () => scoped.filter((r) => (filter === 'wants' ? wants(r) : filter === 'marketing' ? acceptsNews(r) : true)),
    [scoped, filter]
  );
  const shown = filtered.slice(0, visible);
  const hasTests = rows.some((r) => r.is_test);

  function changeFilter(next: Filter) {
    setFilter(next);
    setVisible(PAGE);
  }

  async function resend(id: string) {
    setBusy(id);
    setFlash(null);
    const res = await adminPost(`/api/admin/contactos/${id}`, { action: 'reenviar_aviso' });
    setBusy(null);
    if (!res.ok) {
      setFlash({ type: 'error', text: t('msgError') });
      return;
    }
    const allSent = res.data.email === 'sent' && res.data.telegram === 'sent';
    setFlash(allSent ? { type: 'ok', text: t('msgResent') } : { type: 'warn', text: t('msgResendPartial') });
    await reload();
  }

  async function remove(id: string) {
    setBusy(id);
    setFlash(null);
    const res = await adminPost(`/api/admin/contactos/${id}`, { action: 'borrar' });
    setBusy(null);
    setConfirmDelete(null);
    if (!res.ok) {
      setFlash({ type: 'error', text: t('msgError') });
      return;
    }
    setFlash({ type: 'ok', text: t('msgDeleted') });
    await reload();
  }

  async function removeTests() {
    setBusy('tests');
    setFlash(null);
    const res = await adminPost('/api/admin/contactos/bulk', { action: 'borrar_pruebas' });
    setBusy(null);
    setConfirmTests(false);
    if (!res.ok) {
      setFlash({ type: 'error', text: t('msgError') });
      return;
    }
    setFlash({ type: 'ok', text: t('msgTestsDeleted', { count: Number(res.data.affected ?? 0) }) });
    await reload();
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('never');

  const statusLabel = (s: string | null) =>
    s === 'sent' ? t('statusSent') : s === 'error' ? t('statusError') : s === 'skipped' ? t('statusSkipped') : t('statusNone');
  const statusClass = (s: string | null) =>
    s === 'sent' ? 'bg-green-50 text-green-800' : s === 'error' ? 'bg-red-50 text-red-700' : 'bg-sunbiotan-100 text-sunbiotan-700';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  const cards = [
    { label: t('summaryTotal'), value: summary.total, icon: Users },
    { label: t('summaryViewed'), value: summary.viewed, icon: Eye },
    { label: t('summaryWants'), value: summary.wants, icon: MessageCircle },
    { label: t('summaryMarketing'), value: summary.marketing, icon: BellRing },
  ];
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'wants', label: t('filterWants') },
    { key: 'marketing', label: t('filterMarketing') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('title')}</h1>
          <p className="text-sunbiotan-600 text-sm font-light">{t('subtitle')}</p>
        </div>
        {/* Descarga directa: navegación GET same-origin con la sesión del admin
            (manda Referer, que es lo que valida requireAdmin en modo 'loose'). */}
        <button
          type="button"
          onClick={() => window.location.assign(new URL(EXPORT_URL, window.location.origin).toString())}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-sunbiotan-500 text-white hover:bg-sunbiotan-600"
        >
          <Download className="h-4 w-4" />
          {t('export')}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-sunbiotan-100 p-4">
            <c.icon className="h-4 w-4 text-sunbiotan-500 mb-2" />
            <p className="text-2xl font-light text-sunbiotan-900">{c.value}</p>
            <p className="text-xs text-sunbiotan-600">{c.label}</p>
          </div>
        ))}
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === key ? 'bg-sunbiotan-500 text-white' : 'bg-white border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-sunbiotan-700 cursor-pointer">
            <input
              type="checkbox"
              role="switch"
              checked={includeTests}
              onChange={(e) => { setIncludeTests(e.target.checked); setVisible(PAGE); }}
              className="w-4 h-4 accent-sunbiotan-500"
            />
            {t('includeTests')}
          </label>
          {hasTests && (
            <button
              onClick={() => setConfirmTests(true)}
              className="px-3 py-2 rounded-lg text-sm border border-red-200 bg-white text-red-600 hover:bg-red-50"
            >
              {t('deleteTests')}
            </button>
          )}
        </div>
      </div>

      {confirmTests && (
        <div className="bg-white border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-sunbiotan-900">{t('confirmDeleteTests')}</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmTests(false)} className="px-4 py-2 rounded-lg text-sm border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50">
              {t('cancel')}
            </button>
            <button
              onClick={removeTests}
              disabled={busy === 'tests'}
              className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {busy === 'tests' && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('confirm')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {shown.length === 0 ? (
          <div className="bg-white rounded-xl border border-sunbiotan-100 text-center py-12 text-sunbiotan-500">
            <Users className="h-10 w-10 mx-auto mb-3 text-sunbiotan-300" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          shown.map((r) => {
            const link = r.website_or_instagram
              ? (r.no_instagram ? websiteHref(r.website_or_instagram) : instagramHref(r.website_or_instagram))
              : null;
            const tel = telHref(r.phone);
            const isBusy = busy === r.id;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-sunbiotan-100 shadow-sm p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-sunbiotan-900">{r.name}</p>
                    <p className="text-sm text-sunbiotan-700 flex flex-wrap items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />{r.business_name}
                      <span className="text-sunbiotan-300">·</span>
                      <MapPin className="h-3.5 w-3.5" />{r.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.is_test && <span className="text-[11px] px-2 py-0.5 rounded-full bg-sunbiotan-900 text-sunbiotan-50">{t('badgeTest')}</span>}
                    {wants(r) && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-800">{t('badgeWants')}</span>}
                    {acceptsNews(r) && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{t('badgeMarketing')}</span>}
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sunbiotan-100 text-sunbiotan-700">
                      {isActivityType(r.activity_type) ? tAct(`activityOptions.${r.activity_type}`) : r.activity_type}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sunbiotan-100 text-sunbiotan-700 uppercase">{r.locale}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-sunbiotan-700">
                  <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline">
                    <Mail className="h-3.5 w-3.5" />{r.email}
                  </a>
                  {tel ? (
                    <a href={tel} className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline">
                      <Phone className="h-3.5 w-3.5" />{r.phone}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{r.phone}</span>
                  )}
                  {r.website_or_instagram && (
                    link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline break-all">
                        <Globe className="h-3.5 w-3.5" />{r.website_or_instagram}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 break-all"><Globe className="h-3.5 w-3.5" />{r.website_or_instagram}</span>
                    )
                  )}
                </div>

                <p className="text-[11px] text-sunbiotan-600">
                  {t('received')} {fmtDate(r.created_at)} · {t('visits')}: {r.view_count} · {t('lastVisit')}: {fmtDate(r.last_viewed_at)}
                  {' '}· {t('whatsappClicks')}: {r.whatsapp_clicks} · {t('accesses')}: {r.access_count}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {([
                    [t('notifyEmail'), r.notify_email_status, r.notify_email_error],
                    [t('notifyTelegram'), r.notify_telegram_status, r.notify_telegram_error],
                  ] as const).map(([label, status, error]) => (
                    <span key={label} className={`px-2 py-0.5 rounded-full ${statusClass(status)}`}>
                      {label}: {statusLabel(status)}{status === 'error' && error ? ` (${error})` : ''}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => resend(r.id)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100 disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {t('resend')}
                  </button>
                  {confirmDelete === r.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs text-sunbiotan-900">{t('confirmDelete')}</span>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs border border-sunbiotan-200 text-sunbiotan-700">
                        {t('cancel')}
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                      >
                        {t('confirm')}
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(r.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />{t('delete')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-sunbiotan-600">{t('showing', { shown: shown.length, total: filtered.length })}</p>
          {visible < filtered.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="px-4 py-2 rounded-lg text-sm bg-white border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50"
            >
              {t('showMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
