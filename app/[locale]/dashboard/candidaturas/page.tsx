'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import {
  Inbox, Loader2, Search, Check, X, Mail, Phone, Globe, Trash2, Send, StickyNote,
  MapPin, Building2, AlertTriangle, Copy,
} from 'lucide-react';
import { adminPost } from '@/lib/admin/client-api';
import { websiteHref } from '@/lib/partners/website';
import { isActivityType } from '@/lib/partners/activity';

type Status = 'pending' | 'approved' | 'rejected';

interface PartnerRequest {
  id: string;
  name: string;
  business_name: string;
  city: string;
  phone: string | null;
  email: string;
  message: string | null;
  status: Status;
  created_at: string;
  website_or_instagram: string | null;
  activity_type: string | null;
  locale: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  invited_at: string | null;
  center_id: string | null;
}

interface CenterOption {
  id: string;
  name: string;
  city: string;
}

type Panel = { id: string; kind: 'approve' | 'reject' | 'notes' | 'delete' } | null;
type Flash = { type: 'ok' | 'warn' | 'error'; text: string } | null;

const PAGE = 15;

export default function CandidaturasPage() {
  const t = useTranslations('DashboardCandidaturas');
  const tAct = useTranslations('ProfissionaisPage');

  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  const [rows, setRows] = useState<PartnerRequest[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Status>('pending');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<Panel>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [bulkConfirm, setBulkConfirm] = useState<'reject' | 'delete' | null>(null);

  // Estado de los paneles
  const [centerChoice, setCenterChoice] = useState('');
  const [noteDraft, setNoteDraft] = useState('');

  const fetchAll = useCallback(async () => {
    const [{ data: reqs }, { data: ctrs }] = await Promise.all([
      supabase
        .from('partner_requests')
        .select('id, name, business_name, city, phone, email, message, status, created_at, website_or_instagram, activity_type, locale, admin_notes, reviewed_at, invited_at, center_id')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase.from('centers').select('id, name, city').order('name'),
    ]);
    return { reqs: (reqs as PartnerRequest[]) ?? [], ctrs: (ctrs as CenterOption[]) ?? [] };
  }, [supabase]);

  const apply = useCallback((r: { reqs: PartnerRequest[]; ctrs: CenterOption[] }) => {
    setRows(r.reqs);
    setCenters(r.ctrs);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchAll().then((r) => { if (active) apply(r); });
    return () => { active = false; };
  }, [fetchAll, apply]);

  const load = useCallback(async () => apply(await fetchAll()), [fetchAll, apply]);

  const emailCounts = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const k = r.email.trim().toLowerCase();
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return m;
  }, [rows]);

  const counts = useMemo(() => ({
    pending: rows.filter((r) => r.status === 'pending').length,
    approved: rows.filter((r) => r.status === 'approved').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.status !== tab) return false;
      if (!q) return true;
      return [r.name, r.business_name, r.city, r.email].some((v) => v?.toLowerCase().includes(q));
    });
  }, [rows, tab, query]);

  const shown = filtered.slice(0, visible);

  function switchTab(next: Status) {
    setTab(next);
    setVisible(PAGE);
    setSelected(new Set());
    setPanel(null);
    setBulkConfirm(null);
  }

  function openPanel(id: string, kind: NonNullable<Panel>['kind']) {
    const row = rows.find((r) => r.id === id);
    setPanel({ id, kind });
    setCenterChoice(row?.center_id ?? '');
    setNoteDraft(row?.admin_notes ?? '');
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.id));
  function toggleSelectAllShown() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allShownSelected) shown.forEach((r) => next.delete(r.id));
      else shown.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function errorText(status: number) {
    return status === 409 ? t('msgConflict') : t('msgError');
  }

  async function runAction(id: string, action: string, extra: Record<string, unknown> = {}) {
    setBusy(id);
    setFlash(null);
    const res = await adminPost(`/api/admin/candidaturas/${id}`, { action, ...extra });
    setBusy(null);

    if (!res.ok) {
      setFlash({ type: 'error', text: errorText(res.status) });
      return;
    }

    if (action === 'approve') {
      setFlash(res.data.emailSent === false
        ? { type: 'warn', text: t('msgApprovedNoEmail') }
        : { type: 'ok', text: t('msgApproved') });
    } else if (action === 'resend') {
      setFlash(res.data.emailSent === false
        ? { type: 'warn', text: t('msgResendFailed') }
        : { type: 'ok', text: t('msgResent') });
    } else if (action === 'reject') {
      setFlash({ type: 'ok', text: t('msgRejected') });
    } else if (action === 'delete') {
      setFlash({ type: 'ok', text: t('msgDeleted') });
    } else if (action === 'notes') {
      setFlash({ type: 'ok', text: t('msgNotesSaved') });
    }

    setPanel(null);
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    await load();
  }

  async function runBulk(action: 'reject' | 'delete') {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusy('bulk');
    setFlash(null);
    const res = await adminPost('/api/admin/candidaturas/bulk', { ids, action });
    setBusy(null);
    setBulkConfirm(null);
    if (!res.ok) {
      setFlash({ type: 'error', text: t('msgError') });
      return;
    }
    setFlash({ type: 'ok', text: t('msgBulkDone', { count: Number(res.data.affected ?? 0) }) });
    setSelected(new Set());
    await load();
  }

  const activityLabel = (v: string | null) =>
    v && isActivityType(v) ? tAct(`activityOptions.${v}`) : '—';

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  const tabs: { key: Status; label: string }[] = [
    { key: 'pending', label: t('tabPending') },
    { key: 'approved', label: t('tabApproved') },
    { key: 'rejected', label: t('tabRejected') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('title')}</h1>
        <p className="text-sunbiotan-600 text-sm font-light">{t('subtitle')}</p>
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

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === key ? 'bg-sunbiotan-500 text-white' : 'bg-white border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50'}`}
          >
            {label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/25' : 'bg-sunbiotan-100 text-sunbiotan-700'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sunbiotan-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE); }}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-sunbiotan-700 cursor-pointer">
            <input type="checkbox" checked={allShownSelected} onChange={toggleSelectAllShown} className="w-4 h-4 accent-sunbiotan-500" />
            {t('selectAllShown', { count: shown.length })}
          </label>
          {selected.size > 0 && (
            <>
              <span className="text-xs text-sunbiotan-600">{t('selectedCount', { count: selected.size })}</span>
              {tab !== 'approved' && tab !== 'rejected' && (
                <button
                  onClick={() => setBulkConfirm('reject')}
                  className="px-3 py-2 rounded-lg text-sm border border-sunbiotan-200 bg-white text-sunbiotan-700 hover:bg-sunbiotan-50"
                >
                  {t('bulkReject')}
                </button>
              )}
              <button
                onClick={() => setBulkConfirm('delete')}
                className="px-3 py-2 rounded-lg text-sm border border-red-200 bg-white text-red-600 hover:bg-red-50"
              >
                {t('bulkDelete')}
              </button>
            </>
          )}
        </div>
      </div>

      {bulkConfirm && (
        <div className="bg-white border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-sunbiotan-900">
            {bulkConfirm === 'delete'
              ? t('confirmBulkDelete', { count: selected.size })
              : t('confirmBulkReject', { count: selected.size })}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setBulkConfirm(null)} className="px-4 py-2 rounded-lg text-sm border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50">
              {t('cancel')}
            </button>
            <button
              onClick={() => runBulk(bulkConfirm)}
              disabled={busy === 'bulk'}
              className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {busy === 'bulk' && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('confirm')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {shown.length === 0 ? (
          <div className="bg-white rounded-xl border border-sunbiotan-100 text-center py-12 text-sunbiotan-500">
            <Inbox className="h-10 w-10 mx-auto mb-3 text-sunbiotan-300" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          shown.map((r) => {
            const href = websiteHref(r.website_or_instagram);
            const dup = (emailCounts.get(r.email.trim().toLowerCase()) ?? 0) > 1;
            const isBusy = busy === r.id;
            const isOpen = panel?.id === r.id;

            return (
              <div key={r.id} className="bg-white rounded-xl border border-sunbiotan-100 shadow-sm p-5">
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={t('selectOne', { name: r.name })}
                    className="mt-1 w-4 h-4 accent-sunbiotan-500 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-sunbiotan-900">{r.name}</p>
                        <p className="text-sm text-sunbiotan-700 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />{r.business_name}
                          <span className="text-sunbiotan-300">·</span>
                          <MapPin className="h-3.5 w-3.5" />{r.city}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {dup && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Copy className="h-3 w-3" />{t('duplicate')}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-sunbiotan-100 text-sunbiotan-700">
                          {activityLabel(r.activity_type)}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-sunbiotan-100 text-sunbiotan-700 uppercase">
                          {r.locale ?? 'pt'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-sunbiotan-700">
                      <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline">
                        <Mail className="h-3.5 w-3.5" />{r.email}
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline">
                          <Phone className="h-3.5 w-3.5" />{r.phone}
                        </a>
                      )}
                      {r.website_or_instagram && (
                        href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-sunbiotan-900 hover:underline break-all">
                            <Globe className="h-3.5 w-3.5" />{r.website_or_instagram}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 break-all">
                            <Globe className="h-3.5 w-3.5" />{r.website_or_instagram}
                          </span>
                        )
                      )}
                    </div>

                    {r.message && (
                      <p className="text-sm text-sunbiotan-800 bg-sunbiotan-50 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
                        {r.message}
                      </p>
                    )}

                    {r.admin_notes && !(isOpen && panel?.kind === 'notes') && (
                      <p className="text-xs text-sunbiotan-700 border-l-2 border-sunbiotan-300 pl-3 whitespace-pre-wrap">
                        <span className="font-medium">{t('notes')}:</span> {r.admin_notes}
                      </p>
                    )}

                    <p className="text-[11px] text-sunbiotan-500">
                      {t('receivedOn')} {fmtDate(r.created_at)}
                      {r.reviewed_at && <> · {t('reviewedOn')} {fmtDate(r.reviewed_at)}</>}
                      {r.invited_at && <> · {t('invitedOn')} {fmtDate(r.invited_at)}</>}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => openPanel(r.id, 'approve')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <Check className="h-3.5 w-3.5" />{t('approve')}
                        </button>
                      )}
                      {r.status === 'pending' && (
                        <button
                          onClick={() => openPanel(r.id, 'reject')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100"
                        >
                          <X className="h-3.5 w-3.5" />{t('reject')}
                        </button>
                      )}
                      {r.status === 'approved' && (
                        <button
                          onClick={() => runAction(r.id, 'resend')}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100 disabled:opacity-60"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          {t('resend')}
                        </button>
                      )}
                      <a
                        href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100"
                      >
                        <Mail className="h-3.5 w-3.5" />{t('reply')}
                      </a>
                      <button
                        onClick={() => openPanel(r.id, 'notes')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-50 text-sunbiotan-700 hover:bg-sunbiotan-100"
                      >
                        <StickyNote className="h-3.5 w-3.5" />{t('notes')}
                      </button>
                      <button
                        onClick={() => openPanel(r.id, 'delete')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />{t('delete')}
                      </button>
                    </div>

                    {isOpen && panel?.kind === 'approve' && (
                      <div className="border border-green-200 bg-green-50/40 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium text-sunbiotan-900">{t('approveTitle')}</p>
                        <p className="text-xs text-sunbiotan-700">{t('approveHint')}</p>
                        <label className="block text-xs uppercase tracking-[0.12em] text-sunbiotan-700">
                          {t('approveCenterLabel')}
                          <select
                            value={centerChoice}
                            onChange={(e) => setCenterChoice(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-white border border-sunbiotan-200 rounded-lg text-sm normal-case tracking-normal"
                          >
                            <option value="">{t('noCenter')}</option>
                            {centers.map((c) => (
                              <option key={c.id} value={c.id}>{c.name} · {c.city}</option>
                            ))}
                          </select>
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => setPanel(null)} className="px-3 py-1.5 rounded-lg text-xs border border-sunbiotan-200 text-sunbiotan-700 bg-white">
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => runAction(r.id, 'approve', centerChoice ? { center_id: centerChoice } : {})}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {t('confirmApprove')}
                          </button>
                        </div>
                      </div>
                    )}

                    {isOpen && panel?.kind === 'reject' && (
                      <div className="border border-sunbiotan-200 bg-sunbiotan-50/50 rounded-lg p-4 space-y-3">
                        <label className="block text-xs uppercase tracking-[0.12em] text-sunbiotan-700">
                          {t('rejectNoteLabel')}
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            rows={2}
                            maxLength={3000}
                            className="mt-1 w-full px-3 py-2 bg-white border border-sunbiotan-200 rounded-lg text-sm normal-case tracking-normal resize-none"
                          />
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => setPanel(null)} className="px-3 py-1.5 rounded-lg text-xs border border-sunbiotan-200 text-sunbiotan-700 bg-white">
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => runAction(r.id, 'reject', { notes: noteDraft })}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-700 text-white hover:bg-sunbiotan-800 disabled:opacity-60"
                          >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {t('confirmReject')}
                          </button>
                        </div>
                      </div>
                    )}

                    {isOpen && panel?.kind === 'notes' && (
                      <div className="border border-sunbiotan-200 bg-sunbiotan-50/50 rounded-lg p-4 space-y-3">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={3}
                          maxLength={3000}
                          placeholder={t('notesPlaceholder')}
                          className="w-full px-3 py-2 bg-white border border-sunbiotan-200 rounded-lg text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setPanel(null)} className="px-3 py-1.5 rounded-lg text-xs border border-sunbiotan-200 text-sunbiotan-700 bg-white">
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => runAction(r.id, 'notes', { notes: noteDraft })}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sunbiotan-500 text-white hover:bg-sunbiotan-600 disabled:opacity-60"
                          >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {t('saveNotes')}
                          </button>
                        </div>
                      </div>
                    )}

                    {isOpen && panel?.kind === 'delete' && (
                      <div className="border border-red-200 bg-red-50/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <p className="text-sm text-red-700 inline-flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />{t('confirmDelete')}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setPanel(null)} className="px-3 py-1.5 rounded-lg text-xs border border-sunbiotan-200 text-sunbiotan-700 bg-white">
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => runAction(r.id, 'delete')}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                          >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > visible && (
        <div className="text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE)}
            className="px-5 py-2.5 rounded-lg text-sm border border-sunbiotan-200 bg-white text-sunbiotan-700 hover:bg-sunbiotan-50"
          >
            {t('loadMore', { count: filtered.length - visible })}
          </button>
        </div>
      )}
    </div>
  );
}
