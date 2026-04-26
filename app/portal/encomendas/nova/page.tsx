// app/portal/encomendas/nova/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Loader2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function NovaEncomendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, description, image_url')
        .eq('active', true)
        .order('order_index');

      if (data) setProducts(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === productId);
      if (exists && exists.quantity > 1) {
        return prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  }

  function getQuantity(productId: string) {
    return cart.find((i) => i.product.id === productId)?.quantity || 0;
  }

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (cart.length === 0) return;

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('center_id')
      .eq('id', user.id)
      .single();

    // Crear orden
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        professional_id: user.id,
        center_id: profile?.center_id || null,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !order) {
      setSubmitting(false);
      return;
    }

    // Crear items
    await supabase.from('order_items').insert(
      cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
      }))
    );

    setSuccess(true);
    setTimeout(() => router.push('/portal/encomendas'), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sunbiotan-500 border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sunbiotan-900 font-light text-lg">Encomenda enviada!</p>
        <p className="text-sunbiotan-500 text-sm">A redirecionar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/portal/encomendas"
          className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            Nova Encomenda
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">
            Selecione os produtos e a quantidade
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Productos */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Produtos
          </h2>

          <div className="space-y-4">
            {products.map((product) => {
              const qty = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    qty > 0
                      ? 'border-sunbiotan-300 bg-sunbiotan-50'
                      : 'border-sunbiotan-100 bg-white'
                  }`}
                >
                  {/* Imagen */}
                  {product.image_url ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-sunbiotan-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-sunbiotan-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sunbiotan-900 truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-sunbiotan-500 line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {qty > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 rounded-full border border-sunbiotan-300 flex items-center justify-center hover:bg-sunbiotan-100 transition-colors"
                        >
                          <Minus className="h-3 w-3 text-sunbiotan-600" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-sunbiotan-900">
                          {qty}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="w-7 h-7 rounded-full bg-sunbiotan-500 hover:bg-sunbiotan-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mensaje */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Mensagem (opcional)
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Alguma observação ou pedido especial..."
            rows={3}
            className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={cart.length === 0 || submitting}
          className="w-full py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A enviar...
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              Enviar Encomenda
              {totalItems > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
              )}
            </>
          )}
        </button>
      </form>
    </div>
  );
}