// app/dashboard/produtos/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/image-upload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  image_url_2: string | null;
  active: boolean;
  order_index: number;
}

export default function EditarProdutoPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) {
        router.push('/dashboard/produtos');
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setProduct((prev) => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setError('');

    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description || null,
        image_url: product.image_url || null,
        image_url_2: product.image_url_2 || null,
        active: product.active,
        order_index: product.order_index,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      setError('Erro ao guardar. Tente novamente.');
      setSaving(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/produtos"
          className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            Editar Produto
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">
            {product.name}
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-700 text-sm">Guardado com sucesso!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info básica */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Informação
          </h2>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Ordem de exibição
            </label>
            <input
              type="number"
              name="order_index"
              value={product.order_index}
              onChange={handleChange}
              min={1}
              max={10}
              className="w-24 px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
            />
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Fotos
          </h2>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Foto Principal
            </label>
            <ImageUpload
              currentImageUrl={product.image_url}
              onUpload={(url) => setProduct((prev) => prev ? ({ ...prev, image_url: url }) : null)}
              onRemove={() => setProduct((prev) => prev ? ({ ...prev, image_url: null }) : null)}
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Foto Secundária
            </label>
            <ImageUpload
              currentImageUrl={product.image_url_2}
              onUpload={(url) => setProduct((prev) => prev ? ({ ...prev, image_url_2: url }) : null)}
              onRemove={() => setProduct((prev) => prev ? ({ ...prev, image_url_2: null }) : null)}
            />
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Configurações
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={product.active}
              onChange={handleChange}
              className="w-4 h-4 accent-sunbiotan-500"
            />
            <label htmlFor="active" className="text-sm text-sunbiotan-800 cursor-pointer">
              Produto ativo (visível para profissionais)
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              'Guardar Alterações'
            )}
          </button>

          <Link
            href="/dashboard/produtos"
            className="px-6 py-3 border border-sunbiotan-200 text-sunbiotan-700 text-sm rounded-lg hover:bg-sunbiotan-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}