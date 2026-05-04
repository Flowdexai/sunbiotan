'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowLeft, Loader2, FileText, Video, Image as ImageIcon, Palette, Trash2 } from 'lucide-react';
import Link from 'next/link';

type ResourceType = 'video' | 'image' | 'document' | 'logo';
type ResourceCategory = 'formacao' | 'marketing' | 'marca';

interface FormData {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  thumbnail_url: string;
  category: ResourceCategory;
  order_index: number;
  active: boolean;
}

const typeOptions: { value: ResourceType; label: string; icon: React.ElementType }[] = [
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'image', label: 'Imagem', icon: ImageIcon },
  { value: 'document', label: 'Documento', icon: FileText },
  { value: 'logo', label: 'Logo / Marca', icon: Palette },
];

const categoryOptions: { value: ResourceCategory; label: string }[] = [
  { value: 'formacao', label: 'Formação' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'marca', label: 'Marca' },
];

export default function EditarRecursoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadResource() {
      const { data, error } = await supabase
        .from('resources')
        .select('title, description, type, url, thumbnail_url, category, order_index, active')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.replace('/dashboard/recursos');
        return;
      }

      setForm(data as FormData);
      setLoading(false);
    }

    loadResource();
  }, [id]);

  function handleChange(field: keyof FormData, value: string | number | boolean) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
    setError(null);
  }

  async function handleSubmit() {
    if (!form) return;
    if (!form.title.trim()) return setError('O título é obrigatório.');
    if (!form.url.trim()) return setError('A URL do recurso é obrigatória.');

    setSaving(true);
    setError(null);

    const { error: supabaseError } = await supabase
      .from('resources')
      .update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: form.url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        category: form.category,
        order_index: form.order_index,
        active: form.active,
      })
      .eq('id', id);

    setSaving(false);

    if (supabaseError) {
      setError('Erro ao guardar. Tenta novamente.');
      return;
    }

    router.push('/dashboard/recursos');
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);

    const { error: supabaseError } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (supabaseError) {
      setError('Erro ao eliminar. Tenta novamente.');
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }

    router.push('/dashboard/recursos');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/recursos"
          className="w-9 h-9 rounded-xl border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sunbiotan-900">Editar Recurso</h1>
          <p className="text-sm text-sunbiotan-500">Atualiza as informações do recurso</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-sunbiotan-100 p-6 space-y-5">
        {/* Tipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sunbiotan-700">Tipo de recurso</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleChange('type', value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  form.type === value
                    ? 'border-sunbiotan-500 bg-sunbiotan-50 text-sunbiotan-700'
                    : 'border-sunbiotan-100 text-sunbiotan-400 hover:border-sunbiotan-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">Título *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Ex: Protocolo de Aplicação Sunbiotan"
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Descrição breve do recurso..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm resize-none"
          />
        </div>

        {/* URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">URL do recurso *</label>
          <input
            type="url"
            value={form.url}
            onChange={e => handleChange('url', e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">Thumbnail URL</label>
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={e => handleChange('thumbnail_url', e.target.value)}
            placeholder="https://... (opcional)"
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
          />
        </div>

        {/* Categoría + Orden */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-sunbiotan-700">Categoria</label>
            <select
              value={form.category}
              onChange={e => handleChange('category', e.target.value as ResourceCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm bg-white"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-sunbiotan-700">Ordem</label>
            <input
              type="number"
              min={0}
              value={form.order_index}
              onChange={e => handleChange('order_index', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
            />
          </div>
        </div>

        {/* Activo toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-sunbiotan-700">Recurso ativo</p>
            <p className="text-xs text-sunbiotan-400">Visível para os profissionais</p>
          </div>
          <button
            onClick={() => handleChange('active', !form.active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.active ? 'bg-sunbiotan-500' : 'bg-sunbiotan-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              form.active ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            confirmDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'border border-red-200 text-red-500 hover:bg-red-50'
          }`}
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {confirmDelete ? 'Confirmar eliminação' : 'Eliminar'}
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recursos"
            className="px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sm font-medium text-sunbiotan-600 hover:bg-sunbiotan-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-sunbiotan-500 hover:bg-sunbiotan-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar alterações
          </button>
        </div>
      </div>

      {/* Cancel confirm delete */}
      {confirmDelete && !deleting && (
        <p className="text-xs text-center text-sunbiotan-400">
          Clica novamente em "Confirmar eliminação" para eliminar permanentemente.{' '}
          <button
            onClick={() => setConfirmDelete(false)}
            className="underline hover:text-sunbiotan-600"
          >
            Cancelar
          </button>
        </p>
      )}
    </div>
  );
}