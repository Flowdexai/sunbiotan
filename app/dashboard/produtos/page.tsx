// app/dashboard/produtos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Pencil, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  image_url_2: string | null;
  active: boolean;
  order_index: number;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('order_index');

    if (data) setProducts(data);
    setLoading(false);
  }

  async function toggleActive(product: Product) {
    setUpdating(product.id);
    await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id);
    await loadProducts();
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
          Produtos
        </h1>
        <p className="text-sunbiotan-600 text-sm font-light">
          {products.length} produtos no catálogo
        </p>
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => {
          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                product.active
                  ? 'border-sunbiotan-100'
                  : 'border-sunbiotan-100 opacity-60'
              }`}
            >
              {/* Imagen */}
              {product.image_url ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-sunbiotan-50 flex items-center justify-center">
                  <Package className="h-10 w-10 text-sunbiotan-200" />
                </div>
              )}

              {/* Contenido */}
              <div className="p-5">
                <h3 className="font-medium text-sunbiotan-900 mb-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-sunbiotan-500 line-clamp-2 mb-4">
                    {product.description}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/dashboard/produtos/${product.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-sunbiotan-600 hover:text-sunbiotan-800 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>

                  <button
                    onClick={() => toggleActive(product)}
                    disabled={updating === product.id}
                    className="inline-flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50"
                  >
                    {updating === product.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : product.active ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600">Ativo</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-red-500">Inativo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}