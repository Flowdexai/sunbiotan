// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError('Email ou palavra-passe incorretos.');
                return;
            }

            if (data.session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, approved')
                    .eq('id', data.session.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    router.push('/dashboard');
                } else if (profile?.role === 'professional' && profile?.approved) {
                    router.push('/portal');
                } else {
                    setError('A sua conta ainda não foi aprovada. Aguarde contacto da equipa Sunbiotan.');
                    await supabase.auth.signOut();
                }
            }
        } catch {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sunbiotan-50 flex items-center justify-center px-4">
            {/* Grain texture */}
            <div
                className="fixed inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '180px 180px',
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-sunbiotan-200/30 border border-sunbiotan-100 p-8 md:p-10">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/images/logo-sunbiotan.jpg"
                            alt="Sunbiotan"
                            width={160}
                            height={50}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Título */}
                    <div className="text-center mb-8">
                        <h1 className="font-display font-light text-2xl text-sunbiotan-900 mb-2">
                            Área Privada
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-sunbiotan-500/40" />
                            <p className="text-xs tracking-[0.3em] uppercase text-sunbiotan-600/70 font-light">
                                Acesso exclusivo
                            </p>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-sunbiotan-500/40" />
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sunbiotan-900 placeholder-sunbiotan-400 focus:outline-none focus:border-sunbiotan-500 transition-colors text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Palavra-passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sunbiotan-900 placeholder-sunbiotan-400 focus:outline-none focus:border-sunbiotan-500 transition-colors text-sm pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sunbiotan-400 hover:text-sunbiotan-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm tracking-[0.15em] uppercase font-medium rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sunbiotan-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    A entrar...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-sunbiotan-500 mt-8">
                        Ainda não é parceiro?{' '}
                        <a href="/#profissionais" className="text-sunbiotan-600 hover:underline">
                            Saiba mais
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}