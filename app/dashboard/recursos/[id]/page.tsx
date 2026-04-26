// app/dashboard/recursos/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { FileUpload } from '@/components/dashboard/file-upload';

interface ResourceForm {
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnail_url: string;
  category: string;
  order_index: string;
  active: boolean;
}

const typeOptions = [
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem' },
  { value: 'document', label: 'Documento' },
  { value: 'logo', label: 'Logo' },
];

const categoryOptions = [
  { value: 'formacao', label: 'Formação' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'marca', label: 'Marca' },
];

export default function EditarRecursoPage() {
  const [form, setForm] = useState<ResourceForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('id, title, description, type, url, thumbnail_url, category, order_index, active')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Recurso não encontrado.');
        setLoading(false);
        return;
      }

      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        type: data.type ?? 'video',
        url: data.url ?? '',
        thumbnail_url: data.thumbnail_url ?? '',
        category: data.category ?? 'formacao',
        order_index: String(data.order_index ?? 0),
        active: data.active ?? true,
      });

      setLoading(false);
    }

    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) =>
      prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setError('');

    if (!form.title.trim()) {
      setError('O título é obrigatório.');
      setSaving(false);
      return;
    }

    if (!form.url.trim()) {
      setError('O URL é obrigatório.');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('resources')
      .update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: form.url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        category: form.category,
        order_index: parseInt(form.order_index) || 0,
        active: form.active,
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/dashboard/recursos');
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }

    router.push('/dashboard/recursos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error || 'Recurso não encontrado.'}</p>
        </div>
        <Link
          href="/dashboard/recursos"
          className="inline-flex items-center gap-2 text-sm text-sunbiotan-600 hover:text-sunbiotan-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos recursos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/recursos"
          className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900">
            Editar Recurso
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light truncate max-w-xs">
            {form.title}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-medium text-sunbiotan-900">Informações gerais</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Formação básica em bronzeamento"
              className="w-full px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">
              Descrição
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descrição do recurso..."
              className="w-full px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition bg-white"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">Categoria</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition bg-white"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-medium text-sunbiotan-900">
            Arquivo <span className="text-red-400">*</span>
          </h2>

          {form.type === 'video' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">URL do vídeo</label>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition"
              />
              <p className="text-xs text-sunbiotan-400 font-light">Link do YouTube, Vimeo ou outro serviço de vídeo</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">
                {form.type === 'image' ? 'Imagem' : form.type === 'logo' ? 'Logo' : 'Documento'}
              </label>
              <FileUpload
                bucket="resources"
                folder={form.type}
                accept={form.type === 'image' || form.type === 'logo' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip'}
                maxSizeMB={form.type === 'document' ? 50 : 10}
                imagePreview={form.type === 'image' || form.type === 'logo'}
                currentUrl={form.url || null}
                label={form.type === 'image' ? 'Clique para fazer upload da imagem' : form.type === 'logo' ? 'Clique para fazer upload do logo' : 'Clique para fazer upload do documento'}
                hint={form.type === 'image' || form.type === 'logo' ? 'JPG, PNG, WEBP ou SVG · Máx 10MB' : 'PDF, Word, Excel, PPT ou ZIP · Máx 50MB'}
                onUpload={(url) => setForm((prev) => prev ? { ...prev, url } : prev)}
                onRemove={() => setForm((prev) => prev ? { ...prev, url: '' } : prev)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">
              Miniatura <span className="text-sunbiotan-400 font-light normal-case">(opcional)</span>
            </label>
            <FileUpload
              bucket="resources"
              folder="thumbnails"
              accept="image/*"
              maxSizeMB={5}
              imagePreview
              currentUrl={form.thumbnail_url || null}
              label="Clique para adicionar miniatura"
              hint="JPG, PNG ou WEBP · Máx 5MB"
              onUpload={(url) => setForm((prev) => prev ? { ...prev, thumbnail_url: url } : prev)}
              onRemove={() => setForm((prev) => prev ? { ...prev, thumbnail_url: '' } : prev)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-medium text-sunbiotan-900">Opções</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-sunbiotan-700 uppercase tracking-wide">Ordem</label>
            <input
              type="number"
              name="order_index"
              value={form.order_index}
              onChange={handleChange}
              min="0"
              className="w-32 px-4 py-2.5 rounded-lg border border-sunbiotan-200 text-sm text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 focus:border-transparent transition"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="w-4 h-4 rounded border-sunbiotan-300 text-sunbiotan-500 focus:ring-sunbiotan-400"
            />
            <div>
              <span className="text-sm font-medium text-sunbiotan-900">Ativo</span>
              <p className="text-xs text-sunbiotan-400 font-light">Visível no portal dos parceiros</p>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar alterações
            </button>
            <Link
              href="/dashboard/recursos"
              className="px-5 py-2.5 text-sm text-sunbiotan-600 hover:text-sunbiotan-800 transition-colors"
            >
              Cancelar
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
              confirmDelete ? 'bg-red-500 hover:bg-red-600 text-white' : 'border border-red-200 text-red-500 hover:bg-red-50'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {confirmDelete ? 'Confirmar eliminação' : 'Eliminar'}
          </button>
        </div>

        {confirmDelete && (
          <p className="text-xs text-red-400 -mt-4 pb-4">
            Clique novamente em &quot;Confirmar eliminação&quot; para apagar permanentemente este recurso.{' '}
            <button type="button" onClick={() => setConfirmDelete(false)} className="underline hover:text-red-600 transition-colors">
              Cancelar
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
