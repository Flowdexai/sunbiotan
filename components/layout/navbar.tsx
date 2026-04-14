'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const links = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Centros', href: '/#centros' },
  { label: 'Profissionais', href: '/#profissionais' },
];

interface NavbarProps {
  forceOpaque?: boolean;
}

export function Navbar({ forceOpaque = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

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
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          opaque
            ? 'bg-[#1a130a]/95 backdrop-blur-2xl border-b border-sunbiotan-800/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.a
              href="/"
              animate={{ scale: isScrolled ? 0.88 : 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="origin-left block"
            >
              <Image
                src="/images/logo-sunbiotan.jpg"
                alt="Sunbiotan"
                width={180}
                height={56}
                className="h-11 w-auto object-contain"
                priority
              />
            </motion.a>

            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="relative text-[11px] tracking-[0.25em] uppercase font-medium text-sunbiotan-100/70 hover:text-sunbiotan-300 transition-colors duration-300 group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-sunbiotan-400 to-sunbiotan-500 group-hover:w-full transition-all duration-300" />
                  </a>
                );
              })}
            </div>

            <Link
              href="/centros"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.18em] uppercase font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-sunbiotan-500/25 hover:scale-105 group"
            >
              Encontrar Centro
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-sunbiotan-200 hover:text-sunbiotan-300 transition-colors p-1"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#1a130a]/96 backdrop-blur-2xl border-b border-sunbiotan-800/30 shadow-2xl"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-5">
              {links.map((link) => {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm tracking-[0.2em] uppercase font-light text-sunbiotan-200/80 hover:text-sunbiotan-300 transition-colors"
                  >
                    {link.label}
                  </a>
                );
              })}
              <Link
                href="/centros"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-2 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 text-white text-xs tracking-[0.18em] uppercase font-medium rounded-full"
              >
                Encontrar Centro
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}