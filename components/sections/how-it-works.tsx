'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, Sparkles, Award } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.1 };

const steps = [
  { number: '01', icon: Zap,      title: 'Efeito Flash Imediato', description: 'Bronzeado dourado visível logo após a aplicação, com um resultado fresco e luminoso.' },
  { number: '02', icon: Clock,    title: 'Evolução Natural',       description: 'O bronzeado desenvolve-se progressivamente com o passar das horas, tornando-se mais rico e intenso.' },
  { number: '03', icon: Sparkles, title: 'Resultado Ideal',        description: 'No dia seguinte, a cor atinge o seu ponto perfeito: natural, uniforme e radiante.' },
  { number: '04', icon: Award,    title: '7 a 9 Dias',             description: 'O bronzeado mantém-se durante 7 a 9 dias, consoante o tipo de pele e os cuidados subsequentes.' },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-28 bg-sunbiotan-950 relative overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '36px 36px' }}
      />

      <div
        className="absolute pointer-events-none"
        style={{ top: '-20%', right: '-10%', width: '55%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(193,154,91,0.06) 0%, transparent 65%)' }}
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-4 font-display font-light text-[26vw] leading-none text-sunbiotan-800/20 pointer-events-none select-none"
        style={{ lineHeight: 0.8 }}
      >
        04
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={VP}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="mb-20"
        >
          <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500 mb-4 font-medium">
            O Processo
          </p>
          <h2 className="font-display font-light text-[clamp(2.6rem,6vw,5rem)] text-sunbiotan-100 leading-[1.05] tracking-tight">
            Como{' '}
            <em className="not-italic italic text-sunbiotan-400">funciona?</em>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6 max-w-6xl relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={VP}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: EASE }}
              className="group relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VP}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.12, ease: EASE }}
                  className="hidden lg:block absolute top-7 left-full h-px origin-left"
                  style={{ background: 'linear-gradient(to right, rgba(193,154,91,0.35), rgba(193,154,91,0.08))', width: 'calc(100% - 2rem)', transform: 'translateX(1rem)' }}
                />
              )}

              {/* Number + Icon */}
              <div className="flex items-start gap-3 mb-6">
                <span className="font-display text-5xl md:text-6xl font-light leading-none text-sunbiotan-700/70 group-hover:text-sunbiotan-600/90 transition-colors duration-500 select-none">
                  {step.number}
                </span>
                <div className="mt-2 w-7 h-7 border border-sunbiotan-700/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-sunbiotan-500/55 transition-colors duration-300">
                  <step.icon className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
                </div>
              </div>

              {/* Accent line — scroll driven */}
              <motion.div
                className="h-px mb-5 bg-sunbiotan-500 origin-left"
                style={{ width: '3rem' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VP}
                transition={{ duration: 0.6, delay: 0.25 + index * 0.1, ease: EASE }}
              />

              <h3 className="text-base font-medium text-sunbiotan-100 mb-3 tracking-wide">
                {step.title}
              </h3>
              <p className="text-sm text-sunbiotan-400/60 font-light leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
