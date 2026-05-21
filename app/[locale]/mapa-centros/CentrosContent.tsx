'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { m } from 'framer-motion';
import { Sidebar } from '@/components/map/sidebar';
import { getCenters } from '@/lib/data/centers-data';
import { Center } from '@/types/center';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useTranslations } from 'next-intl';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

export function CentrosContent() {
  const t = useTranslations('CentrosPage');
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);

  const MapView = dynamic(
    () => import('@/components/map/map-view').then(mod => mod.MapView),
    {
      ssr: false,
      loading: () => (
        <div className="w-full h-full bg-sunbiotan-100 animate-pulse flex items-center justify-center rounded-2xl">
          <p className="text-sunbiotan-600 text-sm font-light tracking-wide">{t('loadingMap')}</p>
        </div>
      ),
    }
  );

  useEffect(() => {
    async function loadCenters() {
      try {
        const data = await getCenters();
        setCenters(data);
      } catch (error) {
        console.error('Error loading centers:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCenters();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-sunbiotan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-sunbiotan-500 border-t-transparent mx-auto mb-5" />
          <p className="font-display font-light text-xl text-sunbiotan-700 tracking-wide">
            {t('loadingCenters')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <main className="relative bg-sunbiotan-50 min-h-screen pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '180px 180px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(193,154,91,0.08) 0%, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -top-4 right-0 font-display font-light text-[28vw] leading-none text-sunbiotan-200/20 select-none tracking-tighter pr-4"
            style={{ lineHeight: 0.85 }}
          >
            C
          </div>
        </div>

        <div className="relative container mx-auto px-6">
          <m.div
            variants={headerVariants}
            initial="hidden"
            animate="show"
            className="py-10 md:py-14 text-center"
          >
            <m.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-sunbiotan-500/60" />
              <p className="text-[14px] tracking-[1em] uppercase text-sunbiotan-600/80 font-medium">
                {t('eyebrow')}
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-sunbiotan-500/60" />
            </m.div>

            <m.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: EASE }}
              className="font-display font-light text-[clamp(2.6rem,6vw,5rem)] text-sunbiotan-900 leading-[1.05] tracking-tight mb-5"
            >
              {t('headline')}{' '}
              <em className="not-italic italic text-sunbiotan-600">{t('headlineItalic')}</em>
            </m.h1>

            <m.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex items-center justify-center gap-4 mb-5"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-sunbiotan-500/40" />
              <div className="w-1 h-1 rounded-full bg-sunbiotan-500/60" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-sunbiotan-500/40" />
            </m.div>

            <m.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-sunbiotan-700/80 text-sm font-light tracking-[0.04em] max-w-sm mx-auto"
            >
              {t('subtitle')}
            </m.p>
          </m.div>

          <div className="hidden lg:grid lg:grid-cols-2 gap-10 pb-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
              className="lg:sticky lg:top-24 h-[700px] rounded-2xl overflow-hidden border border-sunbiotan-200/60 shadow-xl shadow-sunbiotan-200/30"
            >
              <MapView
                centers={centers}
                onCenterSelect={setSelectedCenter}
                selectedCenter={selectedCenter}
              />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              <Sidebar
                centers={centers}
                selectedCenter={selectedCenter}
                onCenterClick={setSelectedCenter}
              />
            </m.div>
          </div>

          <div className="lg:hidden pb-12">
            <Sidebar
              centers={centers}
              selectedCenter={selectedCenter}
              onCenterClick={setSelectedCenter}
              mobileLayout
            />
          </div>
        </div>
      </main>
    </APIProvider>
  );
}
