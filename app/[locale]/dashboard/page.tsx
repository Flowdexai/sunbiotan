'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { MapPin, Users, Package, TrendingUp, FolderOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface Stats {
  totalCenters: number;
  activeCenters: number;
  featuredCenters: number;
  totalProfessionals: number;
  pendingProfessionals: number;
  totalResources: number;
  activeResources: number;
}

export default function DashboardPage() {
  const t = useTranslations('DashboardHome');
  const [stats, setStats] = useState<Stats>({
    totalCenters: 0,
    activeCenters: 0,
    featuredCenters: 0,
    totalProfessionals: 0,
    pendingProfessionals: 0,
    totalResources: 0,
    activeResources: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadStats() {
      const [
        { count: totalCenters },
        { count: activeCenters },
        { count: featuredCenters },
        { count: totalProfessionals },
        { count: pendingProfessionals },
        { count: totalResources },
        { count: activeResources },
      ] = await Promise.all([
        supabase.from('centers').select('*', { count: 'exact', head: true }),
        supabase.from('centers').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('centers').select('*', { count: 'exact', head: true }).eq('featured', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional').eq('approved', false),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('active', true),
      ]);

      setStats({
        totalCenters: totalCenters || 0,
        activeCenters: activeCenters || 0,
        featuredCenters: featuredCenters || 0,
        totalProfessionals: totalProfessionals || 0,
        pendingProfessionals: pendingProfessionals || 0,
        totalResources: totalResources || 0,
        activeResources: activeResources || 0,
      });

      setLoading(false);
    }

    loadStats();
  }, [supabase]);

  const statCards = [
    {
      label: t('statTotalCenters'),
      value: stats.totalCenters,
      sub: `${stats.activeCenters} ${t('statActive')}`,
      icon: MapPin,
      color: 'from-sunbiotan-500 to-sunbiotan-600',
    },
    {
      label: t('statFeaturedCenters'),
      value: stats.featuredCenters,
      sub: t('statPremiumVisibility'),
      icon: TrendingUp,
      color: 'from-sunbiotan-600 to-sunbiotan-700',
    },
    {
      label: t('statProfessionals'),
      value: stats.totalProfessionals,
      sub: `${stats.pendingProfessionals} ${t('statPending')}`,
      icon: Users,
      color: 'from-sunbiotan-700 to-sunbiotan-800',
    },
    {
      label: t('statProducts'),
      value: 0,
      sub: t('statComingSoon'),
      icon: Package,
      color: 'from-sunbiotan-800 to-sunbiotan-900',
    },
    {
      label: t('statResources'),
      value: stats.totalResources,
      sub: `${stats.activeResources} ${t('statActive')}`,
      icon: FolderOpen,
      color: 'from-sunbiotan-400 to-sunbiotan-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sunbiotan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
          {t('title')}
        </h1>
        <p className="text-sunbiotan-600 text-sm font-light">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-3xl font-light text-sunbiotan-900 mb-1">
              {card.value}
            </div>
            <div className="text-sm font-medium text-sunbiotan-800 mb-1">
              {card.label}
            </div>
            <div className="text-xs text-sunbiotan-500">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-light text-sunbiotan-900 mb-4">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/centros/nuevo"
            className="bg-white rounded-xl border border-sunbiotan-100 p-5 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
          >
            <MapPin className="h-5 w-5 text-sunbiotan-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-sunbiotan-800">{t('addCenter')}</p>
            <p className="text-xs text-sunbiotan-500 mt-1">{t('addCenterSub')}</p>
          </Link>

          <Link
            href="/dashboard/profissionais"
            className="bg-white rounded-xl border border-sunbiotan-100 p-5 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
          >
            <Users className="h-5 w-5 text-sunbiotan-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-sunbiotan-800">
              {t('pendingProfessionals')}
              {stats.pendingProfessionals > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingProfessionals}
                </span>
              )}
            </p>
            <p className="text-xs text-sunbiotan-500 mt-1">{t('manageProfessionals')}</p>
          </Link>

          <Link
            href="/dashboard/produtos"
            className="bg-white rounded-xl border border-sunbiotan-100 p-5 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
          >
            <Package className="h-5 w-5 text-sunbiotan-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-sunbiotan-800">{t('manageProducts')}</p>
            <p className="text-xs text-sunbiotan-500 mt-1">{t('productCatalog')}</p>
          </Link>

          <Link
            href="/dashboard/recursos"
            className="bg-white rounded-xl border border-sunbiotan-100 p-5 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
          >
            <FolderOpen className="h-5 w-5 text-sunbiotan-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-sunbiotan-800">{t('manageResources')}</p>
            <p className="text-xs text-sunbiotan-500 mt-1">{t('partnerMaterials')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
