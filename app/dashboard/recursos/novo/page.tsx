// app/dashboard/recursos/novo/page.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ResourceForm {
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnail_url: string;
  category: string;
  order_index: number;
  active: boolean;
}

const initialForm: ResourceForm = {
  title: '',
  description: '',
  type: 'video',
  url: '',
  thumbnail_url: '',
  category: 'formacao',
  order_index: 0,
  active: true,
};

export default function NovoRecursoPage() {
  const [form, setForm] = useState<ResourceForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.from('resources').insert({
      title: form.title,
      description: form.description || null,
      type: form.type,
      url: form.url,
      thumbnail_url: form.thumbnail_url || null,
      category: form.category,
      order_index: form.order_index,
      active: form.active,
    });

    if (error) {
      setError('Erro ao criar recurso. Tente novamente.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/recursos');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/recursos"
          className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            Novo Recurso
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">
            Adicionar material ao portal profissional
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Informação
          </h2>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
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
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                Tipo *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
              >
                <option value="video">Vídeo</option>
                <option value="image">Imagem</option>
                <option value="document">Documento</option>
                <option value="logo">Logo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
              >
                <option value="formacao">Formação</option>
                <option value="marketing">Marketing</option>
                <option value="marca">Marca</option>
              </select>
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Links
          </h2>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              URL do Recurso *
            </label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              required
              placeholder="https://..."
              className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
            />
            <p className="text-xs text-sunbiotan-400 mt-1">
              Link direto para o vídeo, imagem, documento ou ficheiro
            </p>
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              URL da Miniatura (opcional)
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={form.thumbnail_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
            />
            <p className="text-xs text-sunbiotan-400 mt-1">
              Imagem de pré-visualização do recurso
            </p>
          </div>
        </div>

        {/* Config */}
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
            Configurações
          </h2>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
              Ordem
            </label>
            <input
              type="number"
              name="order_index"
              value={form.order_index}
              onChange={handleChange}
              min={0}
              className="w-24 px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="w-4 h-4 accent-sunbiotan-500"
            />
            <label htmlFor="active" className="text-sm text-sunbiotan-800 cursor-pointer">
              Recurso ativo (visível no portal)
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              'Criar Recurso'
            )}
          </button>

          <Link
            href="/dashboard/recursos"
            className="px-6 py-3 border border-sunbiotan-200 text-sunbiotan-700 text-sm rounded-lg hover:bg-sunbiotan-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}