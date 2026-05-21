'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Link } from '@/i18n/navigation';
import { Plus, Pencil, Eye, EyeOff, Loader2, FileText, Play, Image as ImageIcon, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  category: string;
  active: boolean;
  order_index: number;
}

const typeIcon: Record<string, React.ElementType> = {
  video: Play,
  image: ImageIcon,
  document: FileText,
  logo: Palette,
};

export default function RecursosDashboardPage() {
  const t = useTranslations('DashboardRecursos');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('category')
      .order('order_index');

    if (data) setResources(data);
    setLoading(false);
  }

  async function toggleActive(resource: Resource) {
    setUpdating(resource.id);
    await supabase
      .from('resources')
      .update({ active: !resource.active })
      .eq('id', resource.id);
    await loadResources();
    setUpdating(null);
  }

  const categoryLabel: Record<string, string> = {
    formacao: t('catFormacao'),
    marketing: t('catMarketing'),
    marca: t('catMarca'),
  };

  const filtered = activeCategory === 'all'
    ? resources
    : resources.filter((r) => r.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('title')}</h1>
          <p className="text-sunbiotan-600 text-sm font-light">{t('count', { count: resources.length })}</p>
        </div>
        <Link
          href="/dashboard/recursos/novo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20"
        >
          <Plus className="h-4 w-4" />
          {t('newResource')}
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'formacao', 'marketing', 'marca'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-sunbiotan-500 text-white' : 'bg-white border border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50'}`}
          >
            {cat === 'all' ? t('filterAll') : categoryLabel[cat]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-sunbiotan-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sunbiotan-500">
            <FileText className="h-10 w-10 mx-auto mb-3 text-sunbiotan-300" />
            <p className="text-sm">{t('notFound')}</p>
          </div>
        ) : (
          <div className="divide-y divide-sunbiotan-50">
            {filtered.map((resource) => {
              const TypeIcon = typeIcon[resource.type] || FileText;
              return (
                <div
                  key={resource.id}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-sunbiotan-50/30 transition-colors ${!resource.active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-sunbiotan-100 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-4 w-4 text-sunbiotan-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sunbiotan-900">{resource.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-sunbiotan-100 text-sunbiotan-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {resource.type}
                        </span>
                        <span className="text-[10px] text-sunbiotan-400">{categoryLabel[resource.category]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(resource)}
                      disabled={updating === resource.id}
                      className="w-8 h-8 rounded-lg hover:bg-sunbiotan-100 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {updating === resource.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-sunbiotan-500" />
                      ) : resource.active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-400" />
                      )}
                    </button>

                    <Link
                      href={`/dashboard/recursos/${resource.id}`}
                      className="w-8 h-8 rounded-lg hover:bg-sunbiotan-100 flex items-center justify-center transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-sunbiotan-500" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
