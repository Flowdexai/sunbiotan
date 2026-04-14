'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Users, TrendingUp, Award } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const perks = [
  { icon: Users,      title: 'Formação e Apoio Contínuo', description: 'Acesso a formação profissional e acompanhamento pela equipa SUN.' },
  { icon: TrendingUp, title: 'Faça Crescer o Negócio',    description: 'Serviços premium de alto valor para diferenciar o seu salão no mercado.' },
  { icon: Award,      title: 'Condições Especiais',       description: 'Rede de profissionais certificados com acesso a benefícios exclusivos.' },
];

export function CtaProfessionals() {
  return (
    <section
      id="profissionais"
      className="py-16 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #1a130a 0%, #261b0e 45%, #3d2e17 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.032] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '30px 30px' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -16, filter: 'blur(3px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500 mb-5 font-medium">
              Profissionais
            </p>

            <h2 className="font-display font-light text-[clamp(2.4rem,5.5vw,4.5rem)] text-sunbiotan-100 mb-6 leading-[1.05] tracking-tight">
              É um profissional
              <br />
              <em className="not-italic italic text-sunbiotan-400">de Estética?</em>
            </h2>

            <motion.div
              className="h-px bg-sunbiotan-600/60 mb-7 origin-left"
              style={{ width: '2.5rem' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VP}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            />

            <p className="text-sunbiotan-300/60 font-light text-base md:text-lg mb-3 leading-relaxed max-w-md">
              Ofereça aos seus clientes o bronzeado mais seguro, mais natural
              e mais eficaz do mercado.
            </p>
            <p className="text-sunbiotan-300/40 font-light text-sm mb-10 leading-relaxed max-w-md">
              SUN também está disponível para salões de beleza, spas e técnicos
              do sector. Junte-se à nossa rede de profissionais certificados.
            </p>

            {/* Perks */}
            <div className="space-y-5 mb-10">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VP}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: EASE }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 border border-sunbiotan-700/45 rounded-xl flex items-center justify-center group-hover:border-sunbiotan-500/55 transition-colors duration-300">
                    <perk.icon className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sunbiotan-100 font-medium text-[13px] mb-0.5 tracking-wide">{perk.title}</p>
                    <p className="text-sunbiotan-400/50 text-sm font-light leading-relaxed">{perk.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="mailto:parceiros@sunbiotan.pt"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-950/50 hover:shadow-sunbiotan-500/20 hover:scale-105"
            >
              Junte-se à Rede
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </motion.a>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 16, filter: 'blur(3px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(ellipse at center, rgba(193,154,91,0.18) 0%, rgba(193,154,91,0.06) 45%, transparent 70%)', transform: 'scale(1.35)' }}
              />
              <div className="absolute inset-0 rounded-full border border-sunbiotan-700/25" />
              <div className="absolute inset-5 rounded-full border border-sunbiotan-700/15" />
              <div
                className="absolute inset-10 rounded-full flex flex-col items-center justify-center text-center gap-1.5"
                style={{ background: 'radial-gradient(ellipse at top, rgba(193,154,91,0.12) 0%, rgba(26,19,10,0.5) 100%)', border: '1px solid rgba(193,154,91,0.15)', backdropFilter: 'blur(6px)' }}
              >
                <span className="font-display text-5xl md:text-6xl font-light text-sunbiotan-400 leading-none golden-shimmer">50+</span>
                <div className="w-5 h-px bg-sunbiotan-600/50 my-1" />
                <p className="text-[10px] tracking-[0.22em] uppercase text-sunbiotan-300/55 font-light">Centros Parceiros</p>
                <p className="text-[10px] tracking-wider text-sunbiotan-500/40 font-light">PT &amp; ES</p>
              </div>
              <div className="absolute top-5 right-6 w-1.5 h-1.5 rounded-full bg-sunbiotan-500/45" />
              <div className="absolute bottom-4 left-8 w-1 h-1 rounded-full bg-sunbiotan-400/30" />
              <div className="absolute top-1/2 -left-3 w-1 h-1 rounded-full bg-sunbiotan-600/40" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
