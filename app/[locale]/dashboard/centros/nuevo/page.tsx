'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { useTranslations } from 'next-intl';

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
  'Portugal', 'España', 'Brasil', 'França', 'Alemanha', 'Itália',
  'Reino Unido', 'Países Baixos', 'Bélgica', 'Suíça', 'Áustria',
  'Polónia', 'República Checa', 'Roménia', 'Hungria', 'Grécia',
  'Suécia', 'Noruega', 'Dinamarca', 'Finlândia', 'México',
  'Argentina', 'Colombia', 'Chile', 'Peru', 'Estados Unidos',
  'Canadá', 'Austrália', 'Japão', 'China',
];

export default function NovoCentroPage() {
  const t = useTranslations('DashboardCentroForm');
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
      setError(t('errorGeocodingAddress'));
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const fullAddress = `${form.address}, ${form.city}, ${form.country}`;
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const data = await res.json();

      if (res.ok) {
        setForm((prev) => ({ ...prev, lat: data.lat.toString(), lng: data.lng.toString() }));
      } else {
        setError(t('errorGeocodingNotFound'));
      }
    } catch {
      setError(t('errorGeocodingGeneral'));
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.lat || !form.lng) {
      setError(t('errorCoords'));
      setLoading(false);
      return;
    }

    const whatsappValue = form.whatsapp_same_as_phone ? form.phone : form.whatsapp || null;

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
      setError(t('errorCreate'));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/dashboard/centros'), 1500);
  };

  const inputClass = 'w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/centros"
          className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
        </Link>
        <div>
          <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">
            {t('titleNew')}
          </h1>
          <p className="text-sunbiotan-600 text-sm font-light">{t('subtitleNew')}</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-700 text-sm">{t('successCreate')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionBasic')}</h2>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelName')}</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelDescription')}</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionLocation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelAddress')}</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelCity')}</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelRegion')}</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelPostal')}</label>
              <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelCountry')}</label>
              <select name="country" value={form.country} onChange={handleChange} required className={inputClass}>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-sunbiotan-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium">{t('labelCoords')}</label>
              <button
                type="button"
                onClick={handleGeocoding}
                disabled={geocoding}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sunbiotan-100 hover:bg-sunbiotan-200 text-sunbiotan-700 text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {geocoding ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                {t('getCoords')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-sunbiotan-600 mb-1">{t('labelLat')}</label>
                <input type="text" name="lat" value={form.lat} onChange={handleChange} placeholder="Ex: 38.7223" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-sunbiotan-600 mb-1">{t('labelLng')}</label>
                <input type="text" name="lng" value={form.lng} onChange={handleChange} placeholder="Ex: -9.1393" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionContact')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelPhone')}</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+351 900 000 000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelInstagram')}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sunbiotan-400 text-sm">@</span>
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="username" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" id="whatsapp_same_as_phone" name="whatsapp_same_as_phone" checked={form.whatsapp_same_as_phone} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
                <label htmlFor="whatsapp_same_as_phone" className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium cursor-pointer">{t('labelWhatsAppSame')}</label>
              </div>
              {!form.whatsapp_same_as_phone && (
                <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder={t('whatsappPlaceholder')} className={inputClass} />
              )}
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelEmail')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelWebsite')}</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="www.exemplo.pt" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelFacebook')}</label>
              <input type="text" name="facebook" value={form.facebook} onChange={handleChange} placeholder="username" className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelPhoto')}</label>
          <ImageUpload
            currentImageUrl={form.image_url}
            onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            onRemove={() => setForm((prev) => ({ ...prev, image_url: null }))}
          />
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionConfig')}</h2>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
            <label htmlFor="featured" className="text-sm text-sunbiotan-800 cursor-pointer">{t('featuredLabel')}</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
            <label htmlFor="active" className="text-sm text-sunbiotan-800 cursor-pointer">{t('activeLabel')}</label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{t('saving')}</>
            ) : (
              t('saveNew')
            )}
          </button>
          <Link href="/dashboard/centros" className="px-6 py-3 border border-sunbiotan-200 text-sunbiotan-700 text-sm rounded-lg hover:bg-sunbiotan-50 transition-colors">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
