'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: 'Sem UV', label: 'Bronzeado Seguro' },
  { value: '7–9', label: 'Dias de Duração' },
  { value: '100%', label: 'Ingredientes Naturais' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.6]);

  const scrollToNext = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section
      ref={heroRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-sunbiotan-950"
    >
      {/* Video background */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-55"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-bg.jpg"
        style={{ WebkitTransform: 'translateZ(0)' }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Multi-layer gradient overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a130a]/85 via-[#3d2e17]/45 to-[#1a130a]/90" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(26,19,10,0.55) 100%)',
        }} />
      </motion.div>

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* Parallax content wrapper */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 container mx-auto px-6 text-center pt-14 md:pt-40"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Brand name — visible to crawlers, styled as eyebrow */}
          <motion.div variants={itemVariants} className="mb-2">
            <p className="font-display font-light text-[clamp(0.85rem,2vw,1.1rem)] tracking-[0.55em] uppercase text-sunbiotan-200/90">
              SUNBIOTAN
            </p>
          </motion.div>

          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-3 md:mb-5">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-sunbiotan-500/60" />
            <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-sunbiotan-200/80 font-light">
              Bronzeado Natural · Sem Raios UV
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-sunbiotan-500/60" />
          </motion.div>

          {/* Main headline */}
          <motion.div variants={itemVariants} className="mb-3 md:mb-4">
            <h1 className="font-display font-light leading-[0.9] tracking-tight">
              <span className="block text-[clamp(2.8rem,9vw,7.5rem)] text-sunbiotan-100/92">
                Cuidamos
              </span>
              <span className="block text-[clamp(2.8rem,9vw,7.5rem)] golden-shimmer">
                da sua pele
              </span>
            </h1>
          </motion.div>

          {/* Animated divider */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-4 mb-3 md:mb-5"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-sunbiotan-500/40" />
            <div className="w-1 h-1 rounded-full bg-sunbiotan-500/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-sunbiotan-500/40" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sunbiotan-100/75 text-sm md:text-base font-light tracking-[0.06em] max-w-xs md:max-w-md mx-auto mb-5 md:mb-8"
          >
            O tratamento natural que respeita e trata a sua pele,
            proporcionando um bronzeado radiante, seguro e duradouro.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-2.5 justify-center items-center mb-6 md:mb-12"
          >
            <Link
              href="/centros"
              className="group inline-flex items-center gap-2.5 px-9 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-400 shadow-xl shadow-sunbiotan-900/40 hover:shadow-sunbiotan-500/20 hover:scale-105"
            >
              Encontrar Centro
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            <a href="#profissionais"
            className="inline-flex items-center gap-2.5 px-9 py-3.5 border border-sunbiotan-300/40 text-sunbiotan-100/85 hover:border-sunbiotan-300/70 hover:text-white text-[11px] tracking-[0.2em] uppercase font-light rounded-full transition-all duration-300 backdrop-blur-sm hover:bg-white/[0.04]"
  >
            Sou Profissional
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-stretch gap-0 border-t border-sunbiotan-700/20 pt-8"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 max-w-[140px] text-center ${i < stats.length - 1 ? 'border-r border-sunbiotan-700/20' : ''}`}
            >
              <div className="font-display text-2xl md:text-3xl font-light text-sunbiotan-200 mb-0.5 tracking-wide">
                {stat.value}
              </div>
              <div className="text-[9px] tracking-[0.22em] uppercase text-sunbiotan-200/60 font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>

      {/* Scroll indicator */ }
  <motion.button
    onClick={scrollToNext}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2, duration: 1 }}
    className="absolute bottom-7 left-1/2 -translate-x-1/2 text-sunbiotan-300/35 hover:text-sunbiotan-300/65 transition-colors duration-300 cursor-pointer"
    aria-label="Scroll"
  >
    <motion.div
      animate={{ y: [0, 7, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ChevronDown className="h-5 w-5" />
    </motion.div>
  </motion.button>
    </section >
  );
}