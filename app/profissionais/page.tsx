// app/profissionais/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import {
  ArrowRight,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: true, amount: 0.15 };

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const benefits = [
  {
    icon: BookOpen,
    title: 'Formação Certificada',
    description:
      'Formação completa e contínua pela equipa Sunbiotan. Os seus colaboradores saem prontos para oferecer resultados de excelência.',
  },
  {
    icon: TrendingUp,
    title: 'Crescimento do Negócio',
    description:
      'Adicione um serviço premium de alto valor ao seu menu. O bronzeado natural SUN diferencia o seu espaço no mercado.',
  },
  {
    icon: ShieldCheck,
    title: 'Produtos Exclusivos',
    description:
      'Acesso aos produtos profissionais Sunbiotan em condições especiais para parceiros, com fórmula 100% natural.',
  },
  {
    icon: Globe2,
    title: 'Rede de Parceiros',
    description:
      'Integre uma rede selecionada de centros em Portugal e Espanha. Visibilidade no nosso mapa e materiais de marketing incluídos.',
  },
  {
    icon: Award,
    title: 'Certificação Oficial',
    description:
      'O seu espaço recebe o selo "Centro Certificado Sunbiotan", transmitindo confiança e qualidade aos seus clientes.',
  },
  {
    icon: Users,
    title: 'Apoio Contínuo',
    description:
      'Suporte dedicado da nossa equipa em cada etapa. Nunca está sozinho no processo de crescimento.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Candidatura',
    description: 'Preencha o formulário abaixo com os dados do seu espaço. Analisamos cada candidatura de forma personalizada.',
  },
  {
    number: '02',
    title: 'Avaliação',
    description: 'A nossa equipa entra em contacto em até 48 horas para conhecer melhor o seu projeto e espaço.',
  },
  {
    number: '03',
    title: 'Formação',
    description: 'Após aprovação, agendamos a formação presencial ou online para a sua equipa.',
  },
  {
    number: '04',
    title: 'Parceiro Oficial',
    description: 'Recebe os produtos, materiais e acesso ao portal exclusivo de parceiros Sunbiotan.',
  },
];

// ─── Form ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  message: string;
}

const emptyForm: FormData = {
  name: '',
  business_name: '',
  city: '',
  phone: '',
  email: '',
  message: '',
};

function CandidatureForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: supabaseError } = await supabase
      .from('partner_requests')
      .insert({
        name: form.name.trim(),
        business_name: form.business_name.trim(),
        city: form.city.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim(),
        message: form.message.trim() || null,
        status: 'pending',
      });

    if (supabaseError) {
      setError('Ocorreu um erro. Tente novamente ou contacte-nos diretamente.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const inputClass =
    'w-full bg-white/[0.04] border border-sunbiotan-700/30 rounded-xl px-5 py-3.5 text-sm text-sunbiotan-100 placeholder:text-sunbiotan-500/50 focus:outline-none focus:border-sunbiotan-500/60 focus:bg-white/[0.06] transition-all duration-300';

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full border border-sunbiotan-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-7 w-7 text-sunbiotan-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-display font-light text-2xl text-sunbiotan-100 mb-3">
          Candidatura enviada
        </h3>
        <p className="text-sunbiotan-400/60 text-sm font-light max-w-xs mx-auto leading-relaxed">
          Recebemos o seu pedido. A nossa equipa entrará em contacto em até 48 horas.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            Nome completo <span className="text-sunbiotan-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="O seu nome"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            Nome do espaço <span className="text-sunbiotan-600">*</span>
          </label>
          <input
            type="text"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            required
            placeholder="Salão, spa, clínica..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            Cidade <span className="text-sunbiotan-600">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Lisboa, Porto, Madrid..."
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            Telefone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+351 XXX XXX XXX"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
          Email <span className="text-sunbiotan-600">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="email@exemplo.pt"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
          Mensagem <span className="text-sunbiotan-500/40 font-light normal-case">(opcional)</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          placeholder="Conte-nos um pouco sobre o seu espaço..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-red-400/80 text-xs font-light">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-950/50 hover:shadow-sunbiotan-500/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Enviar candidatura
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-sunbiotan-500/40 font-light pt-1">
        Já é parceiro?{' '}
        <Link
          href="/login"
          className="text-sunbiotan-400/60 hover:text-sunbiotan-300 transition-colors underline underline-offset-2"
        >
          Aceder ao portal →
        </Link>
      </p>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfissionaisPage() {
  return (
    <>
      <Navbar forceOpaque />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(160deg, #0f0b06 0%, #1a130a 40%, #261b0e 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.028] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '36px 36px' }}
        />
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(193,154,91,0.09) 0%, transparent 70%)' }}
        />

        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
          >
            {/* Eyebrow */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } } }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-sunbiotan-500/50" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-sunbiotan-500/70" strokeWidth={1.5} />
                <p className="text-[10px] tracking-[0.5em] uppercase text-sunbiotan-400/70 font-light">
                  Área Profissional
                </p>
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-sunbiotan-500/50" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } } }}
              className="font-display font-light leading-[0.95] tracking-tight mb-6"
            >
              <span className="block text-[clamp(2.6rem,8vw,7rem)] text-sunbiotan-100/90">
                Eleve o seu
              </span>
              <span className="block text-[clamp(2.6rem,8vw,7rem)] golden-shimmer">
                espaço
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.2, ease: EASE } } }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-sunbiotan-600/40" />
              <div className="w-1 h-1 rounded-full bg-sunbiotan-500/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-sunbiotan-600/40" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } } }}
              className="text-sunbiotan-300/55 text-base md:text-lg font-light tracking-wide max-w-lg mx-auto mb-10 leading-relaxed"
            >
              Ofereça aos seus clientes o bronzeado mais seguro e natural do mercado.
              Junte-se à rede de centros certificados Sunbiotan.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <a
                href="#candidatura"
                className="group inline-flex items-center gap-2.5 px-9 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-950/50 hover:shadow-sunbiotan-500/20 hover:scale-105"
              >
                Quero ser parceiro
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 px-9 py-3.5 border border-sunbiotan-600/35 text-sunbiotan-300/65 hover:border-sunbiotan-400/55 hover:text-sunbiotan-200 text-[11px] tracking-[0.2em] uppercase font-light rounded-full transition-all duration-300 hover:bg-white/[0.03]"
              >
                Já sou parceiro → Login
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
          className="relative w-full container mx-auto px-6 mt-16 md:mt-20"
        >
          <div className="border-t border-sunbiotan-700/20 pt-8 flex justify-center">
            <div className="flex items-stretch gap-0">
              {[
                { value: '50+', label: 'Centros Parceiros' },
                { value: 'PT · ES', label: 'Presença Ibérica' },
                { value: '100%', label: 'Natural' },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className={`px-10 text-center ${i < arr.length - 1 ? 'border-r border-sunbiotan-700/20' : ''}`}
                >
                  <div className="font-display text-2xl md:text-3xl font-light text-sunbiotan-300 mb-0.5 tracking-wide">
                    {stat.value}
                  </div>
                  <div className="text-[9px] tracking-[0.22em] uppercase text-sunbiotan-500/50 font-light">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────────────────────────────────── */}
      <section
        className="py-20 md:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #261b0e 0%, #1a130a 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />

        <div className="relative container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center mb-16 md:mb-20"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">
              Vantagens
            </p>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.8rem)] text-sunbiotan-100 leading-tight tracking-tight">
              Porque escolher{' '}
              <em className="not-italic italic text-sunbiotan-400">Sunbiotan</em>
            </h2>
          </motion.div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-sunbiotan-800/15 rounded-2xl overflow-hidden">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VP}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                className="bg-[#1a130a] p-8 group hover:bg-[#211508] transition-colors duration-300"
              >
                <div className="w-9 h-9 border border-sunbiotan-700/40 rounded-xl flex items-center justify-center mb-5 group-hover:border-sunbiotan-500/50 transition-colors duration-300">
                  <b.icon className="h-4 w-4 text-sunbiotan-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-sunbiotan-100/90 font-medium text-sm mb-2.5 tracking-wide">
                  {b.title}
                </h3>
                <p className="text-sunbiotan-400/45 text-sm font-light leading-relaxed">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
      <section
        className="py-20 md:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1a130a 0%, #211508 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '30px 30px' }}
        />

        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center mb-16 md:mb-20"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">
              Processo
            </p>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.8rem)] text-sunbiotan-100 leading-tight tracking-tight">
              Como se torna{' '}
              <em className="not-italic italic text-sunbiotan-400">parceiro</em>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VP}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className="relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-sunbiotan-700/30 to-transparent" />
                )}
                <div className="text-center">
                  <div className="font-display text-5xl font-light text-sunbiotan-700/30 mb-4 leading-none">
                    {step.number}
                  </div>
                  <h3 className="text-sunbiotan-100/80 font-medium text-sm mb-2 tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-sunbiotan-400/40 text-sm font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULÁRIO ───────────────────────────────────────────────────── */}
      <section
        id="candidatura"
        className="py-20 md:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #211508 0%, #1a130a 50%, #0f0b06 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(193,154,91,0.07) 0%, transparent 70%)' }}
        />

        <div className="relative container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={VP}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-center mb-12"
            >
              <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">
                Candidatura
              </p>
              <h2 className="font-display font-light text-[clamp(2rem,5vw,3.5rem)] text-sunbiotan-100 leading-tight tracking-tight mb-4">
                Comece hoje
              </h2>
              <p className="text-sunbiotan-400/50 text-sm font-light leading-relaxed max-w-sm mx-auto">
                Preencha o formulário e entraremos em contacto em até 48 horas.
                Sem compromisso.
              </p>
            </motion.div>

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(193,154,91,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Top border glow */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-sunbiotan-600/30 to-transparent" />

              <div className="p-8 md:p-10">
                <CandidatureForm />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
