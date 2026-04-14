'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Leaf, Clock, Award, Check, Users } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.08 };

const benefits = [
  { icon: Sparkles, number: '01', title: 'Bronzeado Natural',    description: 'Homogéneo e uniforme, adaptado ao tom de pele de cada pessoa.' },
  { icon: Zap,      number: '02', title: 'Hidratação Profunda',  description: 'Efeito sedoso imediato com hidratação intensa e duradoura.' },
  { icon: Award,    number: '03', title: 'Efeito Tensor',        description: 'Iluminador e anti-envelhecimento com lifting suave visível.' },
  { icon: Shield,   number: '04', title: 'Ação Reparadora',      description: 'Antirrugas, anti-olheiras e anti-celulite numa só aplicação.' },
  { icon: Clock,    number: '05', title: 'Resultados Imediatos', description: 'Visíveis desde a primeira aplicação, sem esperas.' },
  { icon: Leaf,     number: '06', title: '100% Natural',         description: 'Ingredientes activos à base de plantas de agricultura sustentável.' },
  { icon: Check,    number: '07', title: 'Aplicação Rápida',     description: 'Implementação simples, rápida e eficiente em qualquer centro.' },
  { icon: Users,    number: '08', title: 'Para Toda a Pele',     description: 'Indicado para peles delicadas, sensibilizadas ou com necessidades especiais.' },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden" style={{ backgroundColor: '#fdfbf7' }}>
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 font-display font-light text-[28vw] leading-none text-sunbiotan-100/50 pointer-events-none select-none"
        style={{ lineHeight: 0.8 }}
      >
        08
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
          <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-600 mb-4 font-medium">
            Principais Benefícios
          </p>
          <h2 className="font-display font-light text-[clamp(2.6rem,6vw,5rem)] text-sunbiotan-900 leading-[1.05] tracking-tight max-w-lg">
            Por que escolher{' '}
            <em className="not-italic italic text-sunbiotan-600">SUN?</em>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.number}
              initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={VP}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
              className="group relative p-6 border border-sunbiotan-200 rounded-2xl hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sunbiotan-500/8"
              style={{ backgroundColor: '#fdfbf7', cursor: 'default' }}
            >
              {/* Gradient border on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
                style={{
                  background: 'linear-gradient(#fdfbf7, #fdfbf7) padding-box, linear-gradient(135deg, #d4b989, #c19a5b, #a67c3d) border-box',
                  border: '1px solid transparent',
                }}
              />

              <div className="relative z-10">
                <div className="font-display text-2xl font-light text-sunbiotan-300 mb-3 leading-none tracking-wide group-hover:text-sunbiotan-500 transition-colors duration-500">
                  {benefit.number}
                </div>

                <div className="mb-4">
                  <benefit.icon className="h-4 w-4 text-sunbiotan-400 group-hover:text-sunbiotan-500 transition-colors duration-300" strokeWidth={1.5} />
                </div>

                {/* Accent line — animates on scroll */}
                <motion.div
                  className="h-px mb-3.5 bg-sunbiotan-400 origin-left"
                  style={{ width: '1.25rem' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VP}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: EASE }}
                />

                <h3 className="text-[14px] font-medium text-sunbiotan-900 mb-2 tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-[13px] text-sunbiotan-700 font-light leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
