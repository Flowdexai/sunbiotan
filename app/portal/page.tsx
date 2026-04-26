// app/portal/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Package, ShoppingBag, Clock } from 'lucide-react';

interface Profile {
    full_name: string;
    center?: {
        name: string;
        city: string;
    };
}

export default function PortalPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [ordersCount, setOrdersCount] = useState(0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select(`
        full_name,
        centers (
          name,
          city
        )
      `)
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile({
                    full_name: profileData.full_name,
                    center: Array.isArray(profileData.centers)
                        ? profileData.centers[0]
                        : profileData.centers ?? undefined,
                });
            }

            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('professional_id', user.id);

            setOrdersCount(count || 0);
        }

        load();
    }, [supabase]);

    return (
        <div className="space-y-8">
            {/* Bienvenida */}
            <div>
                <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
                    Bem-vindo{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
                </h1>
                {profile?.center && (
                    <p className="text-sunbiotan-600 text-sm font-light">
                        {profile.center.name} · {profile.center.city}
                    </p>
                )}
            </div>

            {/* Cards rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/portal/produtos"
                    className="bg-white rounded-xl border border-sunbiotan-100 p-6 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunbiotan-500 to-sunbiotan-600 flex items-center justify-center mb-4">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-sunbiotan-800 mb-1">
                        Catálogo de Produtos
                    </p>
                    <p className="text-xs text-sunbiotan-500">
                        Ver todos os produtos disponíveis
                    </p>
                </Link>

                <Link
                    href="/portal/encomendas/nova"
                    className="bg-white rounded-xl border border-sunbiotan-100 p-6 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunbiotan-600 to-sunbiotan-700 flex items-center justify-center mb-4">
                        <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-sunbiotan-800 mb-1">
                        Nova Encomenda
                    </p>
                    <p className="text-xs text-sunbiotan-500">
                        Solicitar produtos Sunbiotan
                    </p>
                </Link>

                <Link
                    href="/portal/encomendas"
                    className="bg-white rounded-xl border border-sunbiotan-100 p-6 hover:border-sunbiotan-300 hover:shadow-md transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sunbiotan-700 to-sunbiotan-800 flex items-center justify-center mb-4">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-sunbiotan-800 mb-1">
                        Histórico
                    </p>
                    <p className="text-xs text-sunbiotan-500">
                        {ordersCount} encomenda{ordersCount !== 1 ? 's' : ''} realizadas
                    </p>
                </Link>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-sunbiotan-50 to-white rounded-xl border border-sunbiotan-100 p-6">
                <p className="text-xs tracking-[0.2em] uppercase text-sunbiotan-500 font-medium mb-3">
                    Suporte
                </p>
                <p className="text-sm text-sunbiotan-700 font-light leading-relaxed">
                    Para qualquer dúvida ou assistência, entre em contacto com a equipa Sunbiotan
                    diretamente por email ou telefone. Estamos aqui para ajudar.
                </p>
            </div>
        </div>
    );
}