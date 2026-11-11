'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowLeft, Loader2, FileText, Video, Image as ImageIcon, Palette, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ResourceSourceFields, type SourceMode } from '@/components/dashboard/resource-source-fields';
import { isHttpUrl, PORTAL_RESOURCES_BUCKET } from '@/lib/resources/config';

type ResourceType = 'video' | 'image' | 'document' | 'logo';
type ResourceCategory = 'formacao' | 'marketing' | 'marca' | 'sistema';

interface FormData {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  storage_path: string;
  thumbnail_url: string;
  category: ResourceCategory;
  order_index: number;
  active: boolean;
  featured: boolean;
  locale: string; // '' = todos
}

export default function EditarRecursoPage() {
  const t = useTranslations('DashboardRecursoForm');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState<SourceMode>('link');
  // Path guardado en la base al cargar: si se reemplaza o se elimina el recurso,
  // se borra el objeto del bucket después de guardar.
  const [originalStoragePath, setOriginalStoragePath] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const typeOptions: { value: ResourceType; label: string; icon: React.ElementType }[] = [
    { value: 'video', label: t('typeVideo'), icon: Video },
    { value: 'image', label: t('typeImage'), icon: ImageIcon },
    { value: 'document', label: t('typeDocument'), icon: FileText },
    { value: 'logo', label: t('typeLogo'), icon: Palette },
  ];

  const categoryOptions: { value: ResourceCategory; label: string }[] = [
    { value: 'formacao', label: t('catFormacao') },
    { value: 'marketing', label: t('catMarketing') },
    { value: 'marca', label: t('catMarca') },
    { value: 'sistema', label: t('catSistema') },
  ];

  useEffect(() => {
    async function loadResource() {
      const { data, error } = await supabase
        .from('resources')
        .select('title, description, type, url, storage_path, thumbnail_url, category, order_index, active, featured, locale')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.replace('/dashboard/recursos');
        return;
      }

      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        type: data.type,
        url: data.url ?? '',
        storage_path: data.storage_path ?? '',
        thumbnail_url: data.thumbnail_url ?? '',
        category: data.category,
        order_index: data.order_index ?? 0,
        active: data.active ?? true,
        featured: data.featured ?? false,
        locale: data.locale ?? '',
      });
      setOriginalStoragePath(data.storage_path ?? null);
      setMode(data.storage_path ? 'upload' : 'link');
      setLoading(false);
    }

    loadResource();
  }, [id]);

  function handleChange(field: keyof FormData, value: string | number | boolean) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setError(null);
  }

  async function handleSubmit() {
    if (!form) return;
    if (!form.title.trim()) return setError(t('errorTitle'));
    const url = form.url.trim();
    if (mode === 'upload' && !form.storage_path) return setError(t('errorSource'));
    if (mode === 'link') {
      if (!url) return setError(t('errorSource'));
      if (!isHttpUrl(url)) return setError(t('errorUrlInvalid'));
    }
    const nextStoragePath = mode === 'upload' ? form.storage_path : null;

    setSaving(true);
    setError(null);

    const { error: supabaseError } = await supabase
      .from('resources')
      .update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: mode === 'link' ? url : null,
        storage_path: nextStoragePath,
        thumbnail_url: form.thumbnail_url.trim() || null,
        category: form.category,
        order_index: form.order_index,
        active: form.active,
        featured: form.featured,
        locale: form.locale || null,
      })
      .eq('id', id);

    setSaving(false);

    if (supabaseError) {
      setError(t('errorSave'));
      return;
    }

    // Archivo reemplazado o pasado a enlace: se borra el objeto anterior.
    if (originalStoragePath && originalStoragePath !== nextStoragePath) {
      await supabase.storage.from(PORTAL_RESOURCES_BUCKET).remove([originalStoragePath]);
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
      setError(t('errorDelete'));
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }

    // Recurso borrado: también el objeto del bucket privado (policy delete admin).
    if (originalStoragePath) {
      await supabase.storage.from(PORTAL_RESOURCES_BUCKET).remove([originalStoragePath]);
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
      <div className="flex items-center gap-3">
        <Link href="/dashboard/recursos" className="w-9 h-9 rounded-xl border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors">
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sunbiotan-900">{t('titleEdit')}</h1>
          <p className="text-sm text-sunbiotan-500">{t('subtitleEdit')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-sunbiotan-100 p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sunbiotan-700">{t('labelType')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleChange('type', value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${form.type === value ? 'border-sunbiotan-500 bg-sunbiotan-50 text-sunbiotan-700' : 'border-sunbiotan-100 text-sunbiotan-400 hover:border-sunbiotan-200'}`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">{t('labelTitle')}</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder={t('placeholderTitle')}
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">{t('labelDescription')}</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('placeholderDesc')}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm resize-none"
          />
        </div>

        <ResourceSourceFields
          mode={mode}
          onModeChange={setMode}
          category={form.category}
          storagePath={form.storage_path}
          onStoragePathChange={(v) => handleChange('storage_path', v)}
          url={form.url}
          onUrlChange={(v) => handleChange('url', v)}
          featured={form.featured}
          onFeaturedChange={(v) => handleChange('featured', v)}
          locale={form.locale}
          onLocaleChange={(v) => handleChange('locale', v)}
          labelClass="block text-sm font-medium text-sunbiotan-700 mb-1.5"
          inputClass="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm bg-white"
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-sunbiotan-700">{t('labelThumbnail')}</label>
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={(e) => handleChange('thumbnail_url', e.target.value)}
            placeholder={t('placeholderThumbnail')}
            className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 placeholder:text-sunbiotan-300 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-sunbiotan-700">{t('labelCategory')}</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value as ResourceCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm bg-white"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-sunbiotan-700">{t('labelOrder')}</label>
            <input
              type="number"
              min={0}
              value={form.order_index}
              onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sunbiotan-900 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-sunbiotan-700">{t('activeLabel')}</p>
            <p className="text-xs text-sunbiotan-400">{t('activeDesc')}</p>
          </div>
          <button
            onClick={() => handleChange('active', !form.active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-sunbiotan-500' : 'bg-sunbiotan-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${confirmDelete ? 'bg-red-500 text-white hover:bg-red-600' : 'border border-red-200 text-red-500 hover:bg-red-50'}`}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {confirmDelete ? t('confirmDelete') : t('delete')}
        </button>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/recursos" className="px-4 py-2.5 rounded-xl border border-sunbiotan-200 text-sm font-medium text-sunbiotan-600 hover:bg-sunbiotan-50 transition-colors">
            {t('cancel')}
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-sunbiotan-500 hover:bg-sunbiotan-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('saveEdit')}
          </button>
        </div>
      </div>

      {confirmDelete && !deleting && (
        <p className="text-xs text-center text-sunbiotan-400">
          {t('confirmDeleteHint')}{' '}
          <button onClick={() => setConfirmDelete(false)} className="underline hover:text-sunbiotan-600">
            {t('cancelDelete')}
          </button>
        </p>
      )}
    </div>
  );
}
