'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, Loader2, CheckCircle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0.15 };

type ContactItem = {
  label: string;
  value: string;
  href: string;
} & (
  | { isFa: true; icon: import('@fortawesome/fontawesome-svg-core').IconDefinition }
  | { isFa: false; icon: React.ElementType }
);

const contactInfo: ContactItem[] = [
  {
    isFa: false,
    icon: Mail,
    label: 'Email',
    value: 'info@sunbiotan.pt',
    href: 'mailto:info@sunbiotan.pt',
  },
  {
    isFa: false,
    icon: Phone,
    label: 'Telefone',
    value: '+351 920 253 796',
    href: 'tel:+351920253796',
  },
  {
    isFa: true,
    icon: faInstagram,
    label: 'Instagram',
    value: '@sunbiotan',
    href: 'https://instagram.com/sunbiotan',
  },
  {
    isFa: true,
    icon: faFacebook,
    label: 'Facebook',
    value: 'Sunbiotan',
    href: 'https://www.facebook.com/sunbiotan.eu',
  },
];

interface FormState {
    name: string;
    email: string;
    phone: string;
    message: string;
}

const INITIAL: FormState = { name: '', email: '', phone: '', message: '' };

export function Contact() {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(field: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        setError(null);
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setError('Por favor preencha os campos obrigatórios.');
            return;
        }

        setSending(true);
        setError(null);

        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        setSending(false);

        if (!res.ok) {
            setError('Erro ao enviar. Tenta novamente.');
            return;
        }

        setSuccess(true);
        setForm(INITIAL);
    }

    return (
        <section
            id="contacto"
            className="py-16 md:py-28 relative overflow-hidden bg-[#fdfbf7]"
        >
            <div
                aria-hidden="true"
                className="absolute -top-8 right-0 font-display font-light text-[32vw] leading-none text-sunbiotan-200/30 pointer-events-none select-none tracking-tighter pr-4"
                style={{ lineHeight: 0.85 }}
            >
                C
            </div>

            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={VP}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-sunbiotan-400/50" />
                        <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-600/80 font-medium">
                            Contacto
                        </p>
                        <div className="h-px w-8 bg-sunbiotan-400/50" />
                    </div>
                    <h2 className="font-display font-light text-6xl text-sunbiotan-900 leading-[1.05] tracking-tight">
                        Fale{' '}
                        <em className="not-italic italic text-sunbiotan-600">connosco</em>
                    </h2>
                    <p className="mt-4 text-sunbiotan-600/60 font-light text-base max-w-lg mx-auto leading-relaxed">
                        Tem alguma questão, sugestão ou simplesmente quer saber mais sobre a Sunbiotan?
                        Estamos aqui para ajudar.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto items-start">

                    {/* Formulario */}
                    <motion.div
                        initial={{ opacity: 0, x: -16, filter: 'blur(3px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={VP}
                        transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
                        className="space-y-4"
                    >
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                            >
                                <CheckCircle className="h-12 w-12 text-sunbiotan-500" strokeWidth={1} />
                                <h3 className="font-display font-light text-2xl text-sunbiotan-900">
                                    Mensagem enviada!
                                </h3>
                                <p className="text-sunbiotan-600/60 font-light text-sm">
                                    Entraremos em contacto brevemente.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-2 text-xs tracking-[0.18em] uppercase text-sunbiotan-500 hover:text-sunbiotan-700 transition-colors underline underline-offset-4"
                                >
                                    Enviar outra mensagem
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700/70 font-medium">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="O seu nome"
                                            className="w-full px-4 py-3 bg-white border border-sunbiotan-200 rounded-xl text-sm text-sunbiotan-900 placeholder:text-sunbiotan-400/50 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400/30 focus:border-sunbiotan-400 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700/70 font-medium">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder="email@exemplo.com"
                                            className="w-full px-4 py-3 bg-white border border-sunbiotan-200 rounded-xl text-sm text-sunbiotan-900 placeholder:text-sunbiotan-400/50 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400/30 focus:border-sunbiotan-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700/70 font-medium">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        placeholder="+351 000 000 000"
                                        className="w-full px-4 py-3 bg-white border border-sunbiotan-200 rounded-xl text-sm text-sunbiotan-900 placeholder:text-sunbiotan-400/50 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400/30 focus:border-sunbiotan-400 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700/70 font-medium">
                                        Mensagem *
                                    </label>
                                    <textarea
                                        value={form.message}
                                        onChange={e => handleChange('message', e.target.value)}
                                        placeholder="Como podemos ajudar?"
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white border border-sunbiotan-200 rounded-xl text-sm text-sunbiotan-900 placeholder:text-sunbiotan-400/50 focus:outline-none focus:ring-2 focus:ring-sunbiotan-400/30 focus:border-sunbiotan-400 transition-all resize-none"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={sending}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[11px] tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-sunbiotan-400/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {sending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                    {sending ? 'A enviar...' : 'Enviar mensagem'}
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Datos de contacto */}
                    {/* Datos de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: 16, filter: 'blur(3px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={VP}
                        transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
                        className="space-y-8 lg:pt-8 lg:pl-8"
                    >
                        {contactInfo.map((item, i) => (
                            <motion.a
                                key={item.label}
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                initial={{ opacity: 0, x: 12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={VP}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: EASE }}
                                className="flex items-center gap-5 group"
                            >
                                <div className="flex-shrink-0 w-14 h-14 border border-sunbiotan-200 rounded-2xl flex items-center justify-center group-hover:border-sunbiotan-400 group-hover:bg-sunbiotan-50 transition-all duration-300">
                                    <div className="flex-shrink-0 w-14 h-14 border border-sunbiotan-200 rounded-2xl flex items-center justify-center group-hover:border-sunbiotan-400 group-hover:bg-sunbiotan-50 transition-all duration-300">
                                        {item.isFa ? (
                                            <FontAwesomeIcon icon={item.icon} style={{ width: '24px', height: '24px' }} className="text-sunbiotan-500" />
                                        ) : (
                                            <item.icon className="h-6 w-6 text-sunbiotan-500" strokeWidth={1.5} />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] uppercase text-sunbiotan-500/60 font-medium mb-1">
                                        {item.label}
                                    </p>
                                    <p className="text-base text-sunbiotan-800 group-hover:text-sunbiotan-600 transition-colors font-light">
                                        {item.value}
                                    </p>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>

                </div>
            </div>

            {/* Ornament bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sunbiotan-300/40 to-transparent" />
        </section>
    );
}