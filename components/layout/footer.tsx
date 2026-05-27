'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('Footer');

  const navLinks = [
    { label: t('inicio'), href: '/' },
    { label: t('sobreNos'), href: '/#sobre' },
    { label: t('centros'), href: '/mapa-centros' },
    { label: t('professionalArea'), href: '/profissionais' },
  ];

  const legalLinks = [
    { label: t('cookies'), href: '/cookies' },
    { label: t('privacy'), href: '/privacidade' },
  ];

  return (
    <footer className="bg-sunbiotan-950 relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-sunbiotan-700/40 to-transparent" />

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <div className="relative container mx-auto px-6 pt-16 pb-10">
        <div className="grid md:grid-cols-4 gap-10 md:gap-8 mb-14">

          {/* Brand column */}
          <div className="md:col-span-2">
            <p className="font-display font-medium tracking-[0.2em] text-xl text-sunbiotan-300 mb-4">
              SUNBIOTAN
            </p>
            <p className="text-sunbiotan-400/55 text-sm font-light leading-relaxed mb-6 max-w-xs">
              {t('tagline')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/sunbiotan.eu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 border border-sunbiotan-800/60 rounded-full flex items-center justify-center text-sunbiotan-500/60 hover:border-sunbiotan-500/60 hover:text-sunbiotan-400 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faFacebook} style={{ width: '14px', height: '14px' }} />
              </a>
              <a
                href="https://instagram.com/sunbiotan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 border border-sunbiotan-800/60 rounded-full flex items-center justify-center text-sunbiotan-500/60 hover:border-sunbiotan-500/60 hover:text-sunbiotan-400 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faInstagram} style={{ width: '14px', height: '14px' }} />
              </a>
              <a
                href="mailto:info@sunbiotan.pt"
                aria-label="Email"
                className="w-8 h-8 border border-sunbiotan-800/60 rounded-full flex items-center justify-center text-sunbiotan-500/60 hover:border-sunbiotan-500/60 hover:text-sunbiotan-400 transition-all duration-300"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/80 mb-5 font-medium">
              {t('navigation')}
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sunbiotan-400/50 hover:text-sunbiotan-300 font-light transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/80 mb-5 font-medium">
              {t('contact')}
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <a
                  href="mailto:info@sunbiotan.pt"
                  className="text-sm text-sunbiotan-400/50 hover:text-sunbiotan-300 font-light transition-colors"
                >
                  info@sunbiotan.pt
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-sunbiotan-400/50 font-light">+351 920 253 796</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-sunbiotan-400/50 font-light">{t('location')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sunbiotan-800/30 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

            {/* Left — legal links + copyright */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {legalLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[11px] text-sunbiotan-400/50 hover:text-sunbiotan-300 font-light tracking-wide transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="text-[11px] text-sunbiotan-400/50 tracking-wider font-light">
                © {new Date().getFullYear()} Sunbiotan. {t('allRights')}
              </p>
            </div>

            {/* Right — Livro de Reclamações */}
            <a
              href="https://www.livroreclamacoes.pt/Inicio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('complaintsBook')}
              className="flex-shrink-0 self-start md:self-auto"
            >
              <Image
                src="/images/livro_reclamacoes.png"
                alt="Livro de Reclamações"
                width={120}
                height={120}
                className="object-contain"
              />
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}
