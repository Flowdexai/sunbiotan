// app/portal/recursos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Play, Download, Image as ImageIcon, FileText, Palette } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnail_url: string | null;
  category: string;
  order_index: number;
}

const categoryConfig = {
  formacao: {
    label: 'Formação',
    icon: Play,
    description: 'Vídeos e materiais de formação profissional',
  },
  marketing: {
    label: 'Marketing',
    icon: ImageIcon,
    description: 'Fotos, banners e materiais para redes sociais',
  },
  marca: {
    label: 'Marca',
    icon: Palette,
    description: 'Logos, guia de marca e identidade visual',
  },
};

const typeIcon: Record<string, React.ElementType> = {
  video: Play,
  image: ImageIcon,
  document: FileText,
  logo: Palette,
};

export default function RecursosPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('formacao');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('active', true)
        .order('order_index');

      if (data) setResources(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = resources.filter((r) => r.category === activeCategory);

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
      <div>
        <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
          Recursos
        </h1>
        <p className="text-sunbiotan-600 text-sm font-light">
          Materiais exclusivos para parceiros Sunbiotan
        </p>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = resources.filter((r) => r.category === key).length;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-sunbiotan-500 bg-sunbiotan-50 shadow-sm'
                  : 'border-sunbiotan-100 bg-white hover:border-sunbiotan-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-sunbiotan-500' : 'bg-sunbiotan-100'
                }`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sunbiotan-600'}`} />
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-sunbiotan-900' : 'text-sunbiotan-700'
                }`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-sunbiotan-500 font-light">
                {count} {count === 1 ? 'recurso' : 'recursos'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Recursos */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-12 text-center">
          <p className="text-sunbiotan-500 text-sm font-light">
            Ainda não há recursos nesta categoria.
          </p>
          <p className="text-sunbiotan-400 text-xs mt-1">
            Em breve serão adicionados materiais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((resource) => {
            const TypeIcon = typeIcon[resource.type] || FileText;
            return (
              <div
                key={resource.id}
                className="bg-white rounded-xl border border-sunbiotan-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                {resource.thumbnail_url ? (
                  <div
                    className="h-40 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${resource.thumbnail_url})` }}
                  >
                    {resource.type === 'video' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-5 w-5 text-sunbiotan-600 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 bg-sunbiotan-50 flex items-center justify-center">
                    <TypeIcon className="h-10 w-10 text-sunbiotan-200" />
                  </div>
                )}

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-medium text-sunbiotan-900">
                      {resource.title}
                    </h3>
                    <span className="text-[10px] bg-sunbiotan-100 text-sunbiotan-600 px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide">
                      {resource.type}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-xs text-sunbiotan-500 font-light mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sunbiotan-600 hover:text-sunbiotan-800 transition-colors"
                  >
                    {resource.type === 'video' ? (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Ver vídeo
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        Descarregar
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}