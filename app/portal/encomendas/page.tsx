// app/portal/encomendas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ShoppingBag, Plus, Clock, CheckCircle, Truck, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  products: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    label: 'Confirmada',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-700',
  },
  shipped: {
    label: 'Enviada',
    icon: Truck,
    color: 'bg-purple-100 text-purple-700',
  },
  delivered: {
    label: 'Entregue',
    icon: Package,
    color: 'bg-green-100 text-green-700',
  },
};

export default function EncomendasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          message,
          created_at,
          order_items (
            id,
            quantity,
            products (
              name
            )
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data as unknown as Order[]);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sunbiotan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            Encomendas
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">
            {orders.length} encomenda{orders.length !== 1 ? 's' : ''} realizadas
          </p>
        </div>
        <Link
          href="/portal/encomendas/nova"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20"
        >
          <Plus className="h-4 w-4" />
          Nova Encomenda
        </Link>
      </div>

      {/* Lista */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-sunbiotan-200 mb-4" />
          <p className="text-sunbiotan-600 text-sm font-light mb-4">
            Ainda não realizou nenhuma encomenda
          </p>
          <Link
            href="/portal/encomendas/nova"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 text-white text-sm rounded-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Fazer primeira encomenda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-sunbiotan-100 p-5 shadow-sm"
              >
                {/* Header de la orden */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-sunbiotan-400 font-light">
                      {new Date(order.created_at).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-sunbiotan-300 mt-0.5">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.order_items.map((item) => {
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-sunbiotan-700">{item.products?.name}</span>
                        <span className="text-sunbiotan-500 text-xs">
                          Qtd: {item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mensaje */}
                {order.message && (
                  <div className="bg-sunbiotan-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-sunbiotan-600 font-light">
                      {order.message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}