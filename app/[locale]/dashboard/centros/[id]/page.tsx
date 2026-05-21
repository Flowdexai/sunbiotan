'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { ArrowLeft, Loader2, MapPin, Trash2 } from 'lucide-react';
import { Center } from '@/types/center';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { useTranslations } from 'next-intl';

const countries = [
  'Portugal', 'España', 'Brasil', 'França', 'Alemanha', 'Itália',
  'Reino Unido', 'Países Baixos', 'Bélgica', 'Suíça', 'Áustria',
  'Polónia', 'República Checa', 'Roménia', 'Hungria', 'Grécia',
  'Suécia', 'Noruega', 'Dinamarca', 'Finlândia', 'México',
  'Argentina', 'Colombia', 'Chile', 'Peru', 'Estados Unidos',
  'Canadá', 'Austrália', 'Japão', 'China',
];

export default function EditarCentroPage() {
  const t = useTranslations('DashboardCentroForm');
  const [form, setForm] = useState<Partial<Center> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadCenter() {
      const { data, error } = await supabase.from('centers').select('*').eq('id', id).single();
      if (error || !data) { router.push('/dashboard/centros'); return; }
      setForm(data);
      setLoading(false);
    }
    loadCenter();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGeocoding = async () => {
    if (!form?.address || !form?.city || !form?.country) {
      setError(t('errorGeocodingAddress'));
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
        setForm((prev) => ({ ...prev, lat, lng }));
      } else {
        setError(t('errorNotFoundEdit'));
      }
    } catch {
      setError(t('errorGeocodingEdit'));
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const whatsappValue = form?.whatsapp_same_as_phone ? form?.phone : form?.whatsapp || null;
    const { error } = await supabase.from('centers').update({
      name: form?.name, address: form?.address || null, city: form?.city,
      state: form?.state || null, postal_code: form?.postal_code || null,
      country: form?.country, lat: form?.lat, lng: form?.lng,
      phone: form?.phone || null, whatsapp: whatsappValue,
      whatsapp_same_as_phone: form?.whatsapp_same_as_phone || false,
      instagram: form?.instagram || null, email: form?.email || null,
      website: form?.website || null, facebook: form?.facebook || null,
      featured: form?.featured || false, active: form?.active ?? true,
      description: form?.description || null, updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) { setError(t('errorSave')); setSaving(false); return; }
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setSaving(false); }, 2000);
    router.push('/dashboard/centros');
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await supabase.from('centers').delete().eq('id', id);
    router.push('/dashboard/centros');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sunbiotan-500" />
      </div>
    );
  }

  if (!form) return null;

  const inputClass = 'w-full px-4 py-3 bg-sunbiotan-50 border border-sunbiotan-200 rounded-lg text-sm focus:outline-none focus:border-sunbiotan-500 transition-colors';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/centros" className="w-9 h-9 rounded-lg border border-sunbiotan-200 flex items-center justify-center hover:bg-sunbiotan-50 transition-colors">
            <ArrowLeft className="h-4 w-4 text-sunbiotan-600" />
          </Link>
          <div>
            <h1 className="font-display font-light text-3xl text-sunbiotan-900 mb-1">{t('titleEdit')}</h1>
            <p className="text-sunbiotan-600 text-sm font-light">{form.name}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${confirmDelete ? 'bg-red-500 text-white hover:bg-red-600' : 'border border-red-200 text-red-500 hover:bg-red-50'}`}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {confirmDelete ? t('confirmDelete') : t('delete')}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-700 text-sm">{t('successSave')}</p>
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
            <input type="text" name="name" value={form.name || ''} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelDescription')}</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionLocation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelAddress')}</label>
              <input type="text" name="address" value={form.address || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelCity')}</label>
              <input type="text" name="city" value={form.city || ''} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelRegion')}</label>
              <input type="text" name="state" value={form.state || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelPostal')}</label>
              <input type="text" name="postal_code" value={form.postal_code || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelCountry')}</label>
              <select name="country" value={form.country || 'Portugal'} onChange={handleChange} required className={inputClass}>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-sunbiotan-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium">{t('labelCoordsEdit')}</label>
              <button type="button" onClick={handleGeocoding} disabled={geocoding} className="inline-flex items-center gap-2 px-4 py-2 bg-sunbiotan-100 hover:bg-sunbiotan-200 text-sunbiotan-700 text-xs rounded-lg transition-colors disabled:opacity-50">
                {geocoding ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                {t('updateCoords')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-sunbiotan-600 mb-1">{t('labelLat')}</label>
                <input type="text" name="lat" value={form.lat || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-sunbiotan-600 mb-1">{t('labelLng')}</label>
                <input type="text" name="lng" value={form.lng || ''} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sunbiotan-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-medium text-sunbiotan-900 tracking-[0.1em] uppercase">{t('sectionContact')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelPhone')}</label>
              <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelInstagram')}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sunbiotan-400 text-sm">@</span>
                <input type="text" name="instagram" value={form.instagram || ''} onChange={handleChange} className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" id="whatsapp_same_as_phone" name="whatsapp_same_as_phone" checked={form.whatsapp_same_as_phone || false} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
                <label htmlFor="whatsapp_same_as_phone" className="text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium cursor-pointer">{t('labelWhatsAppSame')}</label>
              </div>
              {!form.whatsapp_same_as_phone && (
                <input type="text" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} placeholder={t('whatsappPlaceholder')} className={inputClass} />
              )}
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelEmail')}</label>
              <input type="email" name="email" value={form.email || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelWebsite')}</label>
              <input type="text" name="website" value={form.website || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-sunbiotan-700 font-medium mb-2">{t('labelFacebook')}</label>
              <input type="text" name="facebook" value={form.facebook || ''} onChange={handleChange} className={inputClass} />
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
            <input type="checkbox" id="featured" name="featured" checked={form.featured || false} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
            <label htmlFor="featured" className="text-sm text-sunbiotan-800 cursor-pointer">{t('featuredLabel')}</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" name="active" checked={form.active ?? true} onChange={handleChange} className="w-4 h-4 accent-sunbiotan-500" />
            <label htmlFor="active" className="text-sm text-sunbiotan-800 cursor-pointer">{t('activeLabel')}</label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-600 hover:to-sunbiotan-700 text-white text-sm rounded-lg transition-all shadow-lg shadow-sunbiotan-500/20 disabled:opacity-70">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />{t('saving')}</> : t('saveEdit')}
          </button>
          <Link href="/dashboard/centros" className="px-6 py-3 border border-sunbiotan-200 text-sunbiotan-700 text-sm rounded-lg hover:bg-sunbiotan-50 transition-colors">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
