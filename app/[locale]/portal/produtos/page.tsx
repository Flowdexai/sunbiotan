'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Package, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  image_url_2: string | null;
  order_index: number;
}

export default function PortalProdutosPage() {
  const t = useTranslations('PortalProdutos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('order_index');

      if (data) setProducts(data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('title')}</h1>
          <p className="text-sunbiotan-600 text-sm font-light">{t('subtitle')}</p>
        </div>
        <Link
          href="/portal/encomendas/nova"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20"
        >
          <ShoppingBag className="h-4 w-4" />
          {t('newOrder')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => {
          const isSelected = selected === product.id;
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-sunbiotan-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {product.image_url ? (
                <div className="relative h-52 w-full">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-52 bg-sunbiotan-50 flex items-center justify-center">
                  <Package className="h-12 w-12 text-sunbiotan-200" />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-medium text-sunbiotan-900 mb-2">{product.name}</h3>

                {product.description && (
                  <p className={`text-sm text-sunbiotan-600 font-light leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>
                    {product.description}
                  </p>
                )}

                {product.description && product.description.length > 100 && (
                  <button
                    onClick={() => setSelected(isSelected ? null : product.id)}
                    className="text-xs text-sunbiotan-500 hover:text-sunbiotan-700 mt-1 transition-colors"
                  >
                    {isSelected ? t('viewLess') : t('viewMore')}
                  </button>
                )}

                {isSelected && product.image_url_2 && (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden mt-4">
                    <Image
                      src={product.image_url_2}
                      alt={`${product.name} - ${t('imageAlt')}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
