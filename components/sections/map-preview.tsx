'use client';

import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const dots = [
  { x: '22%', y: '38%', delay: 0 },
  { x: '35%', y: '55%', delay: 0.07 },
  { x: '48%', y: '30%', delay: 0.14 },
  { x: '60%', y: '60%', delay: 0.21 },
  { x: '72%', y: '42%', delay: 0.28 },
  { x: '55%', y: '48%', delay: 0.35 },
  { x: '28%', y: '65%', delay: 0.42 },
  { x: '80%', y: '55%', delay: 0.49 },
];

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-sunbiotan-600 mb-5 font-medium">
              Onde Fazer?
            </p>
            <h2 className="font-display font-light text-5xl md:text-6xl text-sunbiotan-900 mb-5 leading-tight">
              Encontre o seu{' '}
              <em className="not-italic italic text-sunbiotan-600">Centro</em>
            </h2>
            <p className="text-sunbiotan-700 text-base font-light tracking-wide max-w-md mx-auto">
              Disponível exclusivamente em salões de beleza autorizados.
              Mais de 50 centros certificados em Portugal e Espanha.
            </p>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="relative h-72 md:h-96 rounded-3xl overflow-hidden border border-sunbiotan-200/60 shadow-2xl mb-10"
            style={{ background: 'linear-gradient(135deg, #f9f5ed 0%, #f1e6d3 60%, #e5d4b5 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'linear-gradient(#c19a5b 1px, transparent 1px), linear-gradient(90deg, #c19a5b 1px, transparent 1px)', backgroundSize: '48px 48px' }}
            />

            {dots.map((dot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VP}
                transition={{ duration: 0.4, delay: 0.4 + dot.delay, ease: EASE }}
                className="absolute"
                style={{ left: dot.x, top: dot.y }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sunbiotan-500 shadow-md" />
                  <div className="absolute inset-0 rounded-full bg-sunbiotan-400/25 animate-ping" style={{ animationDuration: `${2.2 + i * 0.25}s` }} />
                </div>
              </motion.div>
            ))}

            <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
              <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm px-4 py-2 rounded-full border border-sunbiotan-200/60 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
                <p className="text-[11px] tracking-[0.18em] uppercase text-sunbiotan-700/80 font-medium">
                  Mapa interactivo disponível em breve
                </p>
              </div>
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
              href="mailto:info@sunbiotan.pt"
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
