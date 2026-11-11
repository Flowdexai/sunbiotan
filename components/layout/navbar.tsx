'use client';

import { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

interface NavbarProps {
  forceOpaque?: boolean;
}

export function Navbar({ forceOpaque = false }: NavbarProps) {
  const t = useTranslations('Navbar');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Object hrefs so next-intl keeps the locale prefix and the hash (/es#sobre, not /#sobre).
  const links = [
    { label: t('inicio'), href: { pathname: '/' } },
    { label: t('sobre'), href: { pathname: '/', hash: 'sobre' } },
    { label: t('centros'), href: { pathname: '/', hash: 'centros' } },
    { label: t('profissionais'), href: { pathname: '/', hash: 'profissionais' } },
    { label: t('contacto'), href: { pathname: '/', hash: 'contacto' } },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 60);
      setIsVisible(currentY < lastScrollY.current || currentY < 80);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opaque = forceOpaque || isScrolled;

  return (
    <>
      <m.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${opaque
          ? 'bg-[#1a130a]/95 backdrop-blur-2xl border-b border-sunbiotan-800/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
          }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <div className="w-[180px]">
              <m.div
                animate={{ scale: isScrolled ? 0.88 : 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="origin-left block"
              >
                <Link href="/">
                  <Image
                    src="/images/logo-sunbiotan.jpg"
                    alt="Sunbiotan"
                    width={180}
                    height={56}
                    className="h-11 w-auto object-contain"
                    priority
                  />
                </Link>
              </m.div>
            </div>

            {/* Links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative text-[11px] tracking-[0.25em] uppercase font-medium text-sunbiotan-50 hover:text-sunbiotan-300 transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-sunbiotan-400 to-sunbiotan-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right side — desktop */}
            <div className="w-[340px] hidden md:flex items-center gap-3 justify-end">
              <LocaleSwitcher />
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-sunbiotan-100/50 text-sunbiotan-50 hover:border-sunbiotan-100/80 hover:text-white text-[11px] tracking-[0.18em] uppercase font-medium rounded-full transition-all duration-300 hover:bg-white/5"
              >
                {t('login')}
              </Link>
              <Link
                href="/mapa-centros"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 hover:from-[#f0dcae] hover:to-[#dcc395] text-sunbiotan-950 text-[11px] tracking-[0.18em] uppercase font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-sunbiotan-500/25 hover:scale-105 group"
              >
                {t('findCenter')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile: compact locale pill + burger */}
            <div className="md:hidden flex items-center gap-3">
              <LocaleSwitcher variant="compact" />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-sunbiotan-50 hover:text-sunbiotan-300 transition-colors p-1"
                aria-label={t('menu')}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>
      </m.nav>

      <AnimatePresence>
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#1a130a]/96 backdrop-blur-2xl border-b border-sunbiotan-800/30 shadow-2xl"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-5">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.2em] uppercase font-medium text-sunbiotan-50 hover:text-sunbiotan-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/profissionais"
                onClick={() => setMobileOpen(false)}
                className="text-sm tracking-[0.2em] uppercase font-medium text-sunbiotan-300 hover:text-sunbiotan-200 transition-colors"
              >
                {t('professionalArea')}
              </Link>
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-sunbiotan-100/50 text-sunbiotan-50 text-xs tracking-[0.18em] uppercase font-medium rounded-full"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/mapa-centros"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e8cf9c] to-sunbiotan-400 text-sunbiotan-950 text-xs tracking-[0.18em] uppercase font-bold rounded-full"
                >
                  {t('findCenter')}
                </Link>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
