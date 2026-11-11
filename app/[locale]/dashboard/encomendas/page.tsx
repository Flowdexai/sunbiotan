'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { Loader2, ShoppingBag, Building2, User } from 'lucide-react';

// Mismo set de estados que maneja el portal (portal/encomendas/page.tsx).
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
type OrderStatus = (typeof STATUSES)[number];

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

interface OrderRow {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  professional_id: string;
  center_id: string | null;
  order_items: { id: string; quantity: number; products: { name: string } | { name: string }[] | null }[];
}

const PAGE = 15;

export default function DashboardEncomendasPage() {
  const t = useTranslations('DashboardEncomendas');
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [centers, setCenters] = useState<Map<string, string>>(new Map());
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Lectura por RLS (orders_select_own_or_admin). Profesionales y centros se
  // resuelven aparte para no depender de FKs embebibles en PostgREST.
  const fetchPage = useCallback(async (n: number) => {
    const { data, count, error: err } = await supabase
      .from('orders')
      .select('id, status, message, created_at, professional_id, center_id, order_items ( id, quantity, products ( name ) )', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, n - 1);

    if (err) return null;
    const rows = (data as unknown as OrderRow[]) ?? [];

    const proIds = [...new Set(rows.map((o) => o.professional_id).filter(Boolean))];
    const centerIds = [...new Set(rows.map((o) => o.center_id).filter((v): v is string => !!v))];
    const [{ data: pros }, { data: ctrs }] = await Promise.all([
      proIds.length
        ? supabase.from('profiles').select('id, full_name, email').in('id', proIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
      centerIds.length
        ? supabase.from('centers').select('id, name, city').in('id', centerIds)
        : Promise.resolve({ data: [] as { id: string; name: string; city: string }[] }),
    ]);
    return {
      rows,
      total: count ?? rows.length,
      names: new Map((pros ?? []).map((p) => [p.id, p.full_name || p.email || ''])),
      centers: new Map((ctrs ?? []).map((c) => [c.id, `${c.name} · ${c.city}`])),
    };
  }, [supabase]);

  type PageData = Awaited<ReturnType<typeof fetchPage>>;
  const apply = useCallback((r: PageData) => {
    if (!r) {
      setError(t('msgError'));
    } else {
      setOrders(r.rows);
      setTotal(r.total);
      setNames(r.names);
      setCenters(r.centers);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    let active = true;
    fetchPage(PAGE).then((r) => { if (active) apply(r); });
    return () => { active = false; };
  }, [fetchPage, apply]);

  const load = useCallback(async (n: number) => apply(await fetchPage(n)), [fetchPage, apply]);

  async function loadMore() {
    const next = limit + PAGE;
    setLoadingMore(true);
    await load(next);
    setLimit(next);
    setLoadingMore(false);
  }

  async function changeStatus(order: OrderRow, status: OrderStatus) {
    if (status === order.status) return;
    setUpdating(order.id);
    setError('');
    // Update por RLS (orders_update_admin).
    const { error: err } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (err) setError(t('msgError'));
    else setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    setUpdating(null);
  }

  const statusLabel = (s: string) =>
    (STATUSES as readonly string[]).includes(s) ? t(`status.${s as OrderStatus}`) : s;

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
        <p className="text-sunbiotan-600 text-sm font-light">{t('count', { count: total })}</p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-sunbiotan-200 mb-4" />
          <p className="text-sunbiotan-600 text-sm font-light">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const color = STATUS_COLOR[order.status as OrderStatus] ?? STATUS_COLOR.pending;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-sunbiotan-100 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sunbiotan-900 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {names.get(order.professional_id) || t('unknownProfessional')}
                    </p>
                    <p className="text-xs text-sunbiotan-600 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {order.center_id ? centers.get(order.center_id) ?? t('noCenter') : t('noCenter')}
                    </p>
                    <p className="text-xs text-sunbiotan-500">
                      {new Date(order.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {' · '}#{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${color}`}>{statusLabel(order.status)}</span>
                    <label className="sr-only" htmlFor={`status-${order.id}`}>{t('statusLabel')}</label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                      disabled={updating === order.id}
                      className="px-3 py-1.5 bg-white border border-sunbiotan-200 rounded-lg text-xs text-sunbiotan-800 disabled:opacity-60"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`status.${s}`)}</option>
                      ))}
                    </select>
                    {updating === order.id && <Loader2 className="h-4 w-4 animate-spin text-sunbiotan-500" />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {order.order_items.map((item) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-sunbiotan-800">{product?.name ?? '—'}</span>
                        <span className="text-sunbiotan-600 text-xs">{t('qty', { qty: item.quantity })}</span>
                      </div>
                    );
                  })}
                </div>

                {order.message && (
                  <div className="bg-sunbiotan-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-sunbiotan-700 whitespace-pre-wrap">{order.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {total > orders.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm border border-sunbiotan-200 bg-white text-sunbiotan-700 hover:bg-sunbiotan-50 disabled:opacity-60"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('loadMore', { count: total - orders.length })}
          </button>
        </div>
      )}
    </div>
  );
}
