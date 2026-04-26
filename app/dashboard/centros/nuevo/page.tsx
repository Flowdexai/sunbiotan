// app/dashboard/centros/nuevo/page.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/image-upload';

interface CenterForm {
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    lat: string;
    lng: string;
    phone: string;
    whatsapp: string;
    whatsapp_same_as_phone: boolean;
    instagram: string;
    email: string;
    website: string;
    facebook: string;
    featured: boolean;
    active: boolean;
    description: string;
    image_url: string | null;
}

const initialForm: CenterForm = {
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Portugal',
    lat: '',
    lng: '',
    phone: '',
    whatsapp: '',
    whatsapp_same_as_phone: false,
    instagram: '',
    email: '',
    website: '',
    facebook: '',
    featured: false,
    active: true,
    description: '',
    image_url: null,
};

const countries = [
    'Portugal',
    'España',
    'Brasil',
    'França',
    'Alemanha',
    'Itália',
    'Reino Unido',
    'Países Baixos',
    'Bélgica',
    'Suíça',
    'Áustria',
    'Polónia',
    'República Checa',
    'Roménia',
    'Hungria',
    'Grécia',
    'Suécia',
    'Noruega',
    'Dinamarca',
    'Finlândia',
    'México',
    'Argentina',
    'Colombia',
    'Chile',
    'Peru',
    'Estados Unidos',
    'Canadá',
    'Austrália',
    'Japão',
    'China',
];

export default function NovoCentroPage() {
    const [form, setForm] = useState<CenterForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleGeocoding = async () => {
        if (!form.address || !form.city || !form.country) {
            setError('Preencha morada, cidade e país antes de geocodificar.');
            return;
        }

        setGeocoding(true);
        setError('');

        try {
            const fullAddress = `${form.address}, ${form.city}, ${form.country}`;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setForm((prev) => ({
                    ...prev,
                    lat: lat.toString(),
                    lng: lng.toString(),
                }));
            } else {
                setError('Não foi possível encontrar as coordenadas. Insira manualmente.');
            }
        } catch {
            setError('Erro ao geocodificar. Tente novamente.');
        } finally {
            setGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!form.lat || !form.lng) {
            setError('As coordenadas são obrigatórias. Use o botão "Obter Coordenadas".');
            setLoading(false);
            return;
        }

        const whatsappValue = form.whatsapp_same_as_phone
            ? form.phone
            : form.whatsapp || null;

        const { error } = await supabase.from('centers').insert({
            name: form.name,
            address: form.address || null,
            city: form.city,
            state: form.state || null,
            postal_code: form.postal_code || null,
            country: form.country,
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            phone: form.phone || null,
            whatsapp: whatsappValue,
            whatsapp_same_as_phone: form.whatsapp_same_as_phone,
            instagram: form.instagram || null,
            email: form.email || null,
            website: form.website || null,
            facebook: form.facebook || null,
            featured: form.featured,
            active: form.active,
            description: form.description || null,
        });

        if (error) {
            setError('Erro ao criar centro. Tente novamente.');
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push('/dashboard/centros'), 1500);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/centros"
                    className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
                </Link>
                <div>
                    <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
                        Novo Centro
                    </h1>
                    <p className="text-sunbiotan-600 text-sm font-light">
                        Adicionar novo centro parceiro
                    </p>
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <p className="text-green-700 text-sm">Centro criado com sucesso! A redirecionar...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informação básica */}
                <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
                        Informação Básica
                    </h2>

                    <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                            Nome do Centro *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                            Descrição
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Localização */}
                <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
                        Localização
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Morada
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Cidade *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Distrito / Região
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Código Postal
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={form.postal_code}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                País *
                            </label>
                            <select
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            >
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Geocoding */}
                    <div className="border-t border-sunbiotan-100 pt-5">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium">
                                Coordenadas *
                            </label>
                            <button
                                type="button"
                                onClick={handleGeocoding}
                                disabled={geocoding}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-sunbiotan-100 hover:bg-sunbiotan-200 text-sunbiotan-700 text-xs rounded-lg transition-colors disabled:opacity-50"
                            >
                                {geocoding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <MapPin className="h-3 w-3" />
                                )}
                                Obter Coordenadas
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-sunbiotan-600 mb-1">Latitude</label>
                                <input
                                    type="text"
                                    name="lat"
                                    value={form.lat}
                                    onChange={handleChange}
                                    placeholder="Ex: 38.7223"
                                    className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-sunbiotan-600 mb-1">Longitude</label>
                                <input
                                    type="text"
                                    name="lng"
                                    value={form.lng}
                                    onChange={handleChange}
                                    placeholder="Ex: -9.1393"
                                    className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contacto */}
                <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
                        Contacto
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Telefone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+351 900 000 000"
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Instagram
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sunbiotan-400 text-sm">@</span>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={form.instagram}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="w-full pl-8 pr-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="checkbox"
                                    id="whatsapp_same_as_phone"
                                    name="whatsapp_same_as_phone"
                                    checked={form.whatsapp_same_as_phone}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-sunbiotan-500"
                                />
                                <label
                                    htmlFor="whatsapp_same_as_phone"
                                    className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium cursor-pointer"
                                >
                                    WhatsApp é o mesmo que o telefone
                                </label>
                            </div>

                            {!form.whatsapp_same_as_phone && (
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={form.whatsapp}
                                    onChange={handleChange}
                                    placeholder="WhatsApp (opcional)"
                                    className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                value={form.website}
                                onChange={handleChange}
                                placeholder="www.exemplo.pt"
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                                Facebook
                            </label>
                            <input
                                type="text"
                                name="facebook"
                                value={form.facebook}
                                onChange={handleChange}
                                placeholder="username"
                                className="w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">
                        Foto do Centro
                    </label>
                    <ImageUpload
                        currentImageUrl={form.image_url}
                        onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
                        onRemove={() => setForm((prev) => ({ ...prev, image_url: null }))}
                    />
                </div>
                {/* Configurações */}
                <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">
                        Configurações
                    </h2>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={form.featured}
                            onChange={handleChange}
                            className="w-4 h-4 accent-sunbiotan-500"
                        />
                        <label htmlFor="featured" className="text-sm text-sunbiotan-800 cursor-pointer">
                            Centro Destacado (aparece em primeiro no mapa)
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="w-4 h-4 accent-sunbiotan-500"
                        />
                        <label htmlFor="active" className="text-sm text-sunbiotan-800 cursor-pointer">
                            Centro Ativo (visível no mapa)
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading || success}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            'Guardar Centro'
                        )}
                    </button>

                    <Link
                        href="/dashboard/centros"
                        className="px-6 py-3 border border-sunbiotan-200 text-sunbiotan-700 text-sm rounded-lg hover:bg-sunbiotan-50 transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}