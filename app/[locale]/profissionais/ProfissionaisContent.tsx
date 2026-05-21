'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: true, amount: 0.15 };

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

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
  const t = useTranslations('ProfissionaisPage');
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/candidatura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError(t('errorSubmit'));
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
      <m.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full border border-sunbiotan-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-7 w-7 text-sunbiotan-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-display font-light text-2xl text-sunbiotan-100 mb-3">{t('successTitle')}</h3>
        <p className="text-sunbiotan-400/60 text-sm font-light max-w-xs mx-auto leading-relaxed">{t('successDesc')}</p>
      </m.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            {t('labelFullName')} <span className="text-sunbiotan-600">*</span>
          </label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder={t('placeholderName')} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            {t('labelBusinessName')} <span className="text-sunbiotan-600">*</span>
          </label>
          <input type="text" name="business_name" value={form.business_name} onChange={handleChange} required placeholder={t('placeholderBusiness')} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
            {t('labelCity')} <span className="text-sunbiotan-600">*</span>
          </label>
          <input type="text" name="city" value={form.city} onChange={handleChange} required placeholder={t('placeholderCity')} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">{t('labelPhone')}</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+351 XXX XXX XXX" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
          {t('labelEmail')} <span className="text-sunbiotan-600">*</span>
        </label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder={t('placeholderEmail')} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/70 font-medium">
          {t('labelMessage')} <span className="text-sunbiotan-600">*</span>
        </label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={4} required placeholder={t('placeholderMessage')} className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-red-400/80 text-xs font-light">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-950/50 hover:shadow-sunbiotan-500/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t('submitBtn')}<ArrowRight className="h-3.5 w-3.5" /></>}
      </button>
    </form>
  );
}

export function ProfissionaisContent() {
  const t = useTranslations('ProfissionaisPage');

  const benefits = [
    { icon: BookOpen, title: t('benefit1Title'), description: t('benefit1Desc') },
    { icon: TrendingUp, title: t('benefit2Title'), description: t('benefit2Desc') },
    { icon: ShieldCheck, title: t('benefit3Title'), description: t('benefit3Desc') },
    { icon: Globe2, title: t('benefit4Title'), description: t('benefit4Desc') },
    { icon: Award, title: t('benefit5Title'), description: t('benefit5Desc') },
    { icon: Users, title: t('benefit6Title'), description: t('benefit6Desc') },
  ];

  const steps = [
    { number: '01', title: t('step1Title'), description: t('step1Desc') },
    { number: '02', title: t('step2Title'), description: t('step2Desc') },
    { number: '03', title: t('step3Title'), description: t('step3Desc') },
    { number: '04', title: t('step4Title'), description: t('step4Desc') },
  ];

  return (
    <>
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(160deg, #0f0b06 0%, #1a130a 40%, #261b0e 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.028] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(193,154,91,0.09) 0%, transparent 70%)' }} />

        <div className="relative container mx-auto px-6 text-center">
          <m.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
          >
            <m.div
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } } }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-sunbiotan-500/50" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-sunbiotan-500/70" strokeWidth={1.5} />
                <p className="text-[14px] tracking-[1em] uppercase text-sunbiotan-400/70 font-light">{t('eyebrow')}</p>
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-sunbiotan-500/50" />
            </m.div>

            <m.h1
              variants={{ hidden: { opacity: 0, y: 24, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } } }}
              className="font-display font-light leading-[0.95] tracking-tight mb-6"
            >
              <span className="block text-[clamp(2.6rem,8vw,7rem)] text-sunbiotan-100/90">{t('headline1')}</span>
              <span className="block text-[clamp(2.6rem,8vw,7rem)] golden-shimmer">{t('headline2')}</span>
            </m.h1>

            <m.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.2, ease: EASE } } }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-sunbiotan-600/40" />
              <div className="w-1 h-1 rounded-full bg-sunbiotan-500/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-sunbiotan-600/40" />
            </m.div>

            <m.p
              variants={{ hidden: { opacity: 0, y: 16, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } } }}
              className="text-sunbiotan-300/55 text-base md:text-lg font-light tracking-wide max-w-lg mx-auto mb-10 leading-relaxed"
            >
              {t('subtitle')}
            </m.p>

            <m.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <a
                href="#candidatura"
                className="group inline-flex items-center gap-2.5 px-9 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-xl shadow-sunbiotan-950/50 hover:shadow-sunbiotan-500/20 hover:scale-105"
              >
                {t('cta1')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 px-9 py-3.5 border border-sunbiotan-600/35 text-sunbiotan-300/65 hover:border-sunbiotan-400/55 hover:text-sunbiotan-200 text-[11px] tracking-[0.2em] uppercase font-light rounded-full transition-all duration-300 hover:bg-white/[0.03]"
              >
                {t('cta2')}
              </Link>
            </m.div>
          </m.div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
          className="relative w-full container mx-auto px-6 mt-16 md:mt-20"
        >
          <div className="border-t border-sunbiotan-700/20 pt-8 flex justify-center">
            <div className="flex items-stretch gap-0">
              {[
                { value: t('stat1Value'), label: t('stat1Label') },
                { value: t('stat2Value'), label: t('stat2Label') },
                { value: t('stat3Value'), label: t('stat3Label') },
              ].map((stat, i, arr) => (
                <div key={stat.label} className={`px-10 text-center ${i < arr.length - 1 ? 'border-r border-sunbiotan-700/20' : ''}`}>
                  <div className="font-display text-2xl md:text-3xl font-light text-sunbiotan-300 mb-0.5 tracking-wide">{stat.value}</div>
                  <div className="text-[9px] tracking-[0.22em] uppercase text-sunbiotan-500/50 font-light">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </m.div>
      </section>

      <section className="py-20 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #261b0e 0%, #1a130a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />
        <div className="relative container mx-auto px-6">
          <m.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center mb-16 md:mb-20"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">{t('benefitsEyebrow')}</p>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.8rem)] text-sunbiotan-100 leading-tight tracking-tight">
              {t('benefitsHeadline')}{' '}
              <em className="not-italic italic text-sunbiotan-400">{t('benefitsHeadlineItalic')}</em>
            </h2>
          </m.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-sunbiotan-800/15 rounded-2xl overflow-hidden">
            {benefits.map((b, i) => (
              <m.div
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
                <h3 className="text-sunbiotan-100/90 font-medium text-sm mb-2.5 tracking-wide">{b.title}</h3>
                <p className="text-sunbiotan-400/45 text-sm font-light leading-relaxed">{b.description}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a130a 0%, #211508 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c19a5b 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="relative container mx-auto px-6">
          <m.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={VP}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center mb-16 md:mb-20"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">{t('stepsEyebrow')}</p>
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.8rem)] text-sunbiotan-100 leading-tight tracking-tight">
              {t('stepsHeadline')}{' '}
              <em className="not-italic italic text-sunbiotan-400">{t('stepsHeadlineItalic')}</em>
            </h2>
          </m.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <m.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VP}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-sunbiotan-700/30 to-transparent" />
                )}
                <div className="text-center">
                  <div className="font-display text-5xl font-light text-sunbiotan-700/30 mb-4 leading-none">{step.number}</div>
                  <h3 className="text-sunbiotan-100/80 font-medium text-sm mb-2 tracking-wide">{step.title}</h3>
                  <p className="text-sunbiotan-400/40 text-sm font-light leading-relaxed">{step.description}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section id="candidatura" className="py-20 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #211508 0%, #1a130a 50%, #0f0b06 100%)' }}>
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(193,154,91,0.07) 0%, transparent 70%)' }} />

        <div className="relative container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={VP}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-center mb-12"
            >
              <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500/70 mb-4 font-medium">{t('formEyebrow')}</p>
              <h2 className="font-display font-light text-[clamp(2rem,5vw,3.5rem)] text-sunbiotan-100 leading-tight tracking-tight mb-4">{t('formHeadline')}</h2>
              <p className="text-sunbiotan-400/50 text-sm font-light leading-relaxed max-w-sm mx-auto">{t('formSubtitle')}</p>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(193,154,91,0.12)', backdropFilter: 'blur(12px)' }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-sunbiotan-600/30 to-transparent" />
              <div className="p-8 md:p-10">
                <CandidatureForm />
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </>
  );
}
