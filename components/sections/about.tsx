'use client';

import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)' },
};

const details = [
  'Sem contra-indicações',
  'Para todo o tipo de pele',
  'Pode ser usado durante todo o ano',
];

export function About() {
  return (
    <section
      id="sobre"
      className="py-16 md:py-28 bg-sunbiotan-50 relative overflow-hidden"
    >
      {/* Huge decorative background letter */}
      <div
        aria-hidden="true"
        className="absolute -top-8 right-0 font-display font-light text-[32vw] leading-none text-sunbiotan-200/30 pointer-events-none select-none tracking-tighter pr-4"
        style={{ lineHeight: 0.85 }}
      >
        S
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 55% at 30% 50%, rgba(193,154,91,0.05) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">

          {/* Left: vertical label */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="hidden md:flex flex-col items-start pt-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-sunbiotan-400/50" />
              <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-600/80 font-medium whitespace-nowrap">
                O que é o SUN?
              </p>
            </div>
            <div className="w-px h-20 bg-gradient-to-b from-sunbiotan-400/50 to-transparent ml-4 mt-2" />
          </motion.div>

          {/* Right: main content */}
          <div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="flex md:hidden items-center gap-3 mb-8"
            >
              <div className="h-px w-8 bg-sunbiotan-400/50" />
              <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-600/80 font-medium">
                O que é o SUN?
              </p>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="font-display font-light text-[clamp(2.6rem,6vw,5rem)] text-sunbiotan-900 mb-8 leading-[1.05] tracking-tight"
            >
              O que é
              <br />
              <em className="not-italic italic text-sunbiotan-600">o SUN?</em>
            </motion.h2>

            {/* Ornament */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              className="origin-left flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-sunbiotan-400/60" />
              <div className="w-1 h-1 rounded-full bg-sunbiotan-500/80" />
              <div className="h-px w-6 bg-sunbiotan-400/30" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="space-y-5 max-w-xl"
            >
              <p className="text-lg md:text-xl text-sunbiotan-800 font-light leading-relaxed tracking-[0.02em]">
                É um ativador da melanina, formulado com ingredientes de origem
                natural, que estimula progressivamente a cor da pele{' '}
                <span className="text-sunbiotan-600 font-medium">sem raios UV</span>.
                Funciona em todos os tipos de pele, mesmo as mais claras ou
                sensibilizadas, com resultados visíveis e seguros.
              </p>
              <p className="text-base text-sunbiotan-700/80 font-light leading-relaxed tracking-[0.02em]">
                Para além de realçar o tom natural da pele, SUN também trata,
                tonifica e ilumina, com um efeito lifting suave, deixando a pele
                visivelmente mais firme e revitalizada.
              </p>
              <p className="text-base text-sunbiotan-700/80 font-light leading-relaxed tracking-[0.02em]">
                Aplicado com um equipamento estético de alta precisão, através de
                um sistema de micro-difusão que deposita suavemente o produto na
                pele, garantindo um bronzeado uniforme, natural e progressivo.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="mt-10 flex flex-wrap gap-2.5"
            >
              {details.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-sunbiotan-400/60 text-[11px] tracking-[0.12em] uppercase text-sunbiotan-700 font-medium bg-sunbiotan-100"
                >
                  <span className="w-1 h-1 rounded-full bg-sunbiotan-500/60 flex-shrink-0" />
                  {d}
                </span>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VP}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mt-10 inline-flex items-center gap-4 border-l-2 border-sunbiotan-400/50 pl-4"
            >
              <span className="font-display text-3xl font-light text-sunbiotan-600">100%</span>
              <p className="text-sm text-sunbiotan-700 font-light leading-snug max-w-[160px]">
                Ingredientes de origem natural
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
