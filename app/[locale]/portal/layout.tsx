'use client';

import { useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, ChevronRight, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('PortalLayout');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const navItems = [
    { label: t('home'), href: '/portal', icon: LayoutDashboard },
    { label: t('products'), href: '/portal/produtos', icon: Package },
    { label: t('orders'), href: '/portal/encomendas', icon: ShoppingBag },
    { label: t('resources'), href: '/portal/recursos', icon: BookOpen },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-sunbiotan-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sunbiotan-950 z-30 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-sunbiotan-800/50">
          <Image
            src="/images/logo-sunbiotan.jpg"
            alt="Sunbiotan"
            width={140}
            height={45}
            className="h-9 w-auto object-contain"
            priority
          />
          <p className="text-sunbiotan-400 text-[10px] tracking-[0.3em] uppercase mt-2 font-light">
            {t('professionalPortal')}
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-sunbiotan-500 text-white' : 'text-sunbiotan-300 hover:bg-sunbiotan-800/50 hover:text-sunbiotan-100'}`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-light tracking-wide">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sunbiotan-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sunbiotan-400 hover:bg-sunbiotan-800/50 hover:text-sunbiotan-100 transition-all duration-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-light tracking-wide">{t('logout')}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-sunbiotan-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-sunbiotan-700">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <p className="text-xs tracking-[0.2em] uppercase text-sunbiotan-500 font-light">
              {t('portalArea')}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sunbiotan-400 to-sunbiotan-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">P</span>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
