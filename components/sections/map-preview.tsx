'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

export function MapPreview() {
  return (
    <section
      id="centros"
      className="py-16 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdfbf7 0%, #f9f5ed 40%, #f1e6d3 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(193,154,91,0.08) 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-sunbiotan-400/50" />
              <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-600/80 font-medium">
                Onde Fazer?
              </p>
              <div className="h-px w-8 bg-sunbiotan-400/50" />
            </div>
            <h2 className="font-display font-light text-[clamp(2.2rem,5vw,4rem)] text-sunbiotan-900 leading-[1.05] tracking-tight mb-5">
              Encontre o seu{' '}
              <em className="not-italic italic text-sunbiotan-600">Centro</em>
            </h2>
            <p className="text-sunbiotan-700/60 text-base font-light max-w-md mx-auto leading-relaxed">
              Disponível exclusivamente em Centros Autorizados Sunbiotan.
            </p>
          </motion.div>

          {/* Mapa */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="relative rounded-3xl overflow-hidden border border-sunbiotan-200/60 shadow-2xl shadow-sunbiotan-300/20 mb-10 max-h-[350px]"
          >
            <Image
              src="/images/map-preview.png"
              alt="Mapa de centros Sunbiotan"
              width={1200}
              height={600}
              style={{
                width: '100%',
                height: '350px',
                objectFit: 'cover',
                objectPosition: 'center 70%'
              }}
              className=""
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(249,245,237,0.3) 0%, transparent 10%, transparent 90%, rgba(249,245,237,0.3) 100%), linear-gradient(to bottom, rgba(249,245,237,0.2) 0%, transparent 15%, transparent 85%, rgba(249,245,237,0.4) 100%)'
              }}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <a
                href="/centros"
                className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-5 py-2.5 rounded-full border border-sunbiotan-200/60 shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <span className="text-[11px] tracking-[0.18em] uppercase text-sunbiotan-700 font-medium">
                  Ver mapa interactivo
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-sunbiotan-500 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="flex justify-center"
          >
            <a
              href="/centros"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-400/20 hover:scale-105"
            >
              Encontrar um Centro
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}