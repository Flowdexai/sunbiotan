'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Star, Navigation, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Center } from '@/types/center';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';

const MapView = dynamic(
  () => import('./map-view').then(mod => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-sunbiotan-100 animate-pulse flex items-center justify-center rounded-2xl">
        <p className="text-sunbiotan-600 text-sm font-light tracking-wide">...</p>
      </div>
    ),
  }
);

interface SidebarProps {
  centers: Center[];
  selectedCenter: Center | null;
  onCenterClick: (center: Center) => void;
  mobileLayout?: boolean;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

interface CenterWithDistance extends Center {
  distance?: number;
}

interface SearchLocation {
  lat: number;
  lng: number;
  name: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VP = { once: false, amount: 0 };

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: 'blur(3px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: 'blur(3px)',
    transition: { duration: 0.4 }
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export function Sidebar({ centers, selectedCenter, onCenterClick, mobileLayout = false }: SidebarProps) {
  const t = useTranslations('Sidebar');
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [centersWithDistance, setCentersWithDistance] = useState<CenterWithDistance[]>([]);

  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, {
      types: ['geocode'],
      fields: ['geometry', 'formatted_address', 'name'],
    });
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        setSearchLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.formatted_address || place.name || t('selectedLocation'),
        });
      }
    });
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [placesLib, t]);

  useEffect(() => {
    if (searchLocation) {
      const withDistances = centers.map(center => ({
        ...center,
        distance: getDistanceKm(searchLocation.lat, searchLocation.lng, center.lat, center.lng),
      }));
      withDistances.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setCentersWithDistance(withDistances);
    } else {
      setCentersWithDistance(centers.map(c => ({ ...c, distance: undefined })));
    }
  }, [centers, searchLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('locationNotSupported'));
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: t('yourLocation'),
        });
        if (inputRef.current) inputRef.current.value = '';
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t('locationDenied'));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t('locationUnavailable'));
            break;
          case error.TIMEOUT:
            setLocationError(t('locationTimeout'));
            break;
          default:
            setLocationError(t('locationError'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    setSearchLocation(null);
    setLocationError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const searchResults = searchLocation ? centersWithDistance.slice(0, 15) : [];
  const featuredCenters: CenterWithDistance[] = [];
  const regularCenters: CenterWithDistance[] = [];

  const viewOnMapLabel = t('viewOnMap');

  return (
    <div className="space-y-10">

      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      >
        <h1 className="font-display font-light text-[clamp(2rem,3.5vw,3rem)] text-sunbiotan-900 leading-[1.05] tracking-tight">
          {t('heading')}{' '}
          <em className="not-italic italic text-sunbiotan-600">{t('headingItalic')}</em>
        </h1>
        <div className="flex items-center gap-3 mt-5">
          <div className="h-px w-10 bg-sunbiotan-400/60" />
          <div className="w-1 h-1 rounded-full bg-sunbiotan-500/80" />
          <div className="h-px w-6 bg-sunbiotan-400/30" />
        </div>
      </m.div>

      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        className="space-y-3"
      >
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sunbiotan-500/70" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 h-11 bg-white border border-sunbiotan-200 rounded-full text-sm text-sunbiotan-900 placeholder:text-sunbiotan-400/60 focus:border-sunbiotan-500 focus:outline-none focus:ring-2 focus:ring-sunbiotan-500/20 transition-all"
            />
          </div>
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="h-11 w-11 border border-sunbiotan-200 rounded-full bg-white hover:bg-sunbiotan-50 hover:border-sunbiotan-400 flex items-center justify-center text-sunbiotan-600 hover:text-sunbiotan-800 transition-all flex-shrink-0 disabled:opacity-50"
            title={t('useLocation')}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {locationError && (
          <p className="text-xs text-red-500 text-center tracking-wide">{locationError}</p>
        )}

        {searchLocation && (
          <div className="flex items-center justify-between bg-sunbiotan-50 border border-sunbiotan-200/60 rounded-full px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-sunbiotan-600 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs text-sunbiotan-800 font-light tracking-wide">
                {t('distancesFrom')}{' '}
                <strong className="font-medium">{searchLocation.name}</strong>
              </span>
            </div>
            <button
              onClick={clearLocation}
              className="text-sunbiotan-400 hover:text-sunbiotan-700 ml-2 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </m.div>

      {mobileLayout && (
        <m.div
          ref={mapRef}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VP}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-[400px] rounded-2xl overflow-hidden border border-sunbiotan-200/60 shadow-lg shadow-sunbiotan-100/50"
        >
          <MapView centers={centers} onCenterSelect={onCenterClick} selectedCenter={selectedCenter} />
        </m.div>
      )}

      {searchLocation && searchResults.length > 0 && (
        <div>
          <m.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-8 bg-sunbiotan-400/50" />
            <h2 className="font-display font-light text-xl text-sunbiotan-900 tracking-tight">
              {t('nearbyTitle')}
            </h2>
            <span className="text-xs text-sunbiotan-400 font-light">
              ({searchResults.length})
            </span>
          </m.div>
          <m.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-5">
            {searchResults.map((center, index) => (
              <NearbyCard
                key={center.id}
                center={center}
                rank={index + 1}
                isSelected={selectedCenter?.id === center.id}
                onClick={() => onCenterClick(center)}
                onScrollToMap={scrollToMap}
                viewOnMapLabel={viewOnMapLabel}
              />
            ))}
          </m.div>
        </div>
      )}

      {!searchLocation && featuredCenters.length > 0 && (
        <div>
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-8 bg-sunbiotan-400/50" />
            <h2 className="font-display font-light text-xl text-sunbiotan-900 tracking-tight">
              {t('premiumTitle')}
            </h2>
          </m.div>
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={VP} className="space-y-6">
            {featuredCenters.map((center) => (
              <FeaturedCenterCard
                key={center.id}
                center={center}
                isSelected={selectedCenter?.id === center.id}
                onClick={() => onCenterClick(center)}
                onScrollToMap={scrollToMap}
                showDistance={false}
                viewOnMapLabel={viewOnMapLabel}
              />
            ))}
          </m.div>
        </div>
      )}

      {!searchLocation && regularCenters.length > 0 && (
        <div>
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-8 bg-sunbiotan-400/30" />
            <h2 className="font-display font-light text-xl text-sunbiotan-900 tracking-tight">
              {t('certifiedTitle')}
            </h2>
          </m.div>
          <m.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0 }} className="grid md:grid-cols-2 gap-5">
            {regularCenters.map((center) => (
              <RegularCenterCard
                key={center.id}
                center={center}
                isSelected={selectedCenter?.id === center.id}
                onClick={() => onCenterClick(center)}
                onScrollToMap={scrollToMap}
                showDistance={false}
                viewOnMapLabel={viewOnMapLabel}
              />
            ))}
          </m.div>
        </div>
      )}

      {searchLocation && searchResults.length === 0 && (
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-3 mb-5"
        >
          <MapPin className="h-10 w-10 mx-auto text-sunbiotan-300 mb-4" strokeWidth={1} />
          <p className="font-display font-light text-xl text-sunbiotan-700">
            {t('notFound')}
          </p>
        </m.div>
      )}
    </div>
  );
}

function NearbyCard({
  center, rank, isSelected, onClick, onScrollToMap, viewOnMapLabel,
}: {
  center: CenterWithDistance;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
  onScrollToMap: () => void;
  viewOnMapLabel: string;
}) {
  return (
    <m.div
      variants={fadeUp}
      className={`p-5 rounded-2xl transition-all duration-300 border flex flex-col ${isSelected
        ? 'border-sunbiotan-500 bg-sunbiotan-50 shadow-lg shadow-sunbiotan-200/50'
        : 'border-sunbiotan-200/60 bg-white hover:border-sunbiotan-300 hover:shadow-md hover:shadow-sunbiotan-100/30'
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-sunbiotan-500 to-sunbiotan-600 text-white flex items-center justify-center font-medium text-[10px] mt-0.5">
            {rank}
          </span>
          <h3 className="font-medium text-sm text-sunbiotan-900 flex items-center gap-1.5 flex-wrap">
            {center.name}
            {center.featured && <Star className="h-3 w-3 text-sunbiotan-500 fill-sunbiotan-500 flex-shrink-0" />}
          </h3>
        </div>
        {center.distance !== undefined && (
          <span className="inline-flex items-center gap-1 bg-sunbiotan-100 text-sunbiotan-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0">
            <Navigation className="h-2.5 w-2.5" strokeWidth={1.5} />
            {formatDistance(center.distance)}
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs text-sunbiotan-600/70">
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-sunbiotan-500" strokeWidth={1.5} />
          <div>
            <p>{center.address}</p>
            <p className="font-medium text-sunbiotan-700 mt-0.5">{center.city}</p>
          </div>
        </div>
        {center.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
            <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="hover:text-sunbiotan-700 transition-colors" onClick={(e) => e.stopPropagation()}>
              {center.phone}
            </a>
          </div>
        )}
        {center.instagram && (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faInstagram} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
            <a href={`https://instagram.com/${center.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
              @{center.instagram.replace('@', '')}
            </a>
          </div>
        )}
        {center.facebook && (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFacebook} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
            <a href={center.facebook} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
              Facebook
            </a>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <button
          className="w-full py-2.5 text-[10px] tracking-[0.18em] uppercase font-medium rounded-full bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white transition-all duration-300 hover:shadow-md hover:shadow-sunbiotan-400/20 hover:scale-[1.02]"
          style={{ touchAction: 'manipulation' }}
          onClick={() => { onClick(); onScrollToMap(); }}
        >
          {viewOnMapLabel}
        </button>
      </div>
    </m.div>
  );
}

function FeaturedCenterCard({
  center, isSelected, onClick, onScrollToMap, showDistance, viewOnMapLabel,
}: {
  center: CenterWithDistance;
  isSelected: boolean;
  onClick: () => void;
  onScrollToMap: () => void;
  showDistance: boolean;
  viewOnMapLabel: string;
}) {
  return (
    <m.div
      variants={fadeUp}
      className={`rounded-2xl transition-all duration-300 overflow-hidden border ${isSelected
        ? 'border-sunbiotan-500 shadow-xl shadow-sunbiotan-200/50 scale-[1.01]'
        : 'border-sunbiotan-200/60 hover:border-sunbiotan-400/60 hover:shadow-xl hover:shadow-sunbiotan-100/50'
        }`}
    >
      {center.image_url && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image src={center.image_url} alt={center.name} fill sizes="(max-width: 1024px) 100vw, 500px" className="object-cover hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-sunbiotan-950/40 to-transparent" />
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 text-white px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase font-medium shadow-lg">
              <Star className="h-3 w-3 fill-white" strokeWidth={0} />
              Premium
            </span>
          </div>
          {showDistance && center.distance !== undefined && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-sunbiotan-700 px-2.5 py-1 rounded-full text-xs font-medium shadow">
                <Navigation className="h-3 w-3" strokeWidth={1.5} />
                {formatDistance(center.distance)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6 bg-sunbiotan-50/50">
        <h3 className="font-display font-light text-xl text-sunbiotan-900 mb-4 tracking-tight">{center.name}</h3>

        <div className="space-y-2.5 text-xs text-sunbiotan-600/80 mb-5">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-sunbiotan-500" strokeWidth={1.5} />
            <div>
              <p>{center.address}</p>
              <p className="font-medium text-sunbiotan-700 mt-0.5">{center.city}</p>
            </div>
          </div>
          {center.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
              <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="hover:text-sunbiotan-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                {center.phone}
              </a>
            </div>
          )}
          {center.instagram && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInstagram} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
              <a href={`https://instagram.com/${center.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
                @{center.instagram.replace('@', '')}
              </a>
            </div>
          )}
          {center.facebook && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFacebook} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
              <a href={center.facebook} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
                Facebook
              </a>
            </div>
          )}
          {center.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
              <span>{center.email}</span>
            </div>
          )}
        </div>

        <button
          className="w-full py-2.5 bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-full transition-all duration-300 hover:shadow-md hover:shadow-sunbiotan-400/20 hover:scale-[1.02]"
          style={{ touchAction: 'manipulation' }}
          onClick={() => { onClick(); onScrollToMap(); }}
        >
          {viewOnMapLabel}
        </button>
      </div>
    </m.div>
  );
}

function RegularCenterCard({
  center, isSelected, onClick, onScrollToMap, showDistance, viewOnMapLabel,
}: {
  center: CenterWithDistance;
  isSelected: boolean;
  onClick: () => void;
  onScrollToMap: () => void;
  showDistance: boolean;
  viewOnMapLabel: string;
}) {
  return (
    <m.div
      variants={fadeUp}
      className={`p-5 rounded-2xl transition-all duration-300 border flex flex-col ${isSelected
        ? 'border-sunbiotan-500 bg-sunbiotan-50 shadow-lg shadow-sunbiotan-200/50'
        : 'border-sunbiotan-200/60 bg-white hover:border-sunbiotan-300 hover:shadow-md hover:shadow-sunbiotan-100/30'
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-sm text-sunbiotan-900">{center.name}</h3>
        {showDistance && center.distance !== undefined && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-sunbiotan-100 text-sunbiotan-700 flex-shrink-0">
            {formatDistance(center.distance)}
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs text-sunbiotan-600/70">
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-sunbiotan-500" strokeWidth={1.5} />
          <div>
            <p>{center.address}</p>
            <p className="font-medium text-sunbiotan-700 mt-0.5">{center.city}</p>
          </div>
        </div>
        {center.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-sunbiotan-500" strokeWidth={1.5} />
            <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="hover:text-sunbiotan-700 transition-colors" onClick={(e) => e.stopPropagation()}>
              {center.phone}
            </a>
          </div>
        )}
        {center.instagram && (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faInstagram} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
            <a href={`https://instagram.com/${center.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
              @{center.instagram.replace('@', '')}
            </a>
          </div>
        )}
        {center.facebook && (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFacebook} className="h-3.5 w-3.5 text-sunbiotan-500 flex-shrink-0" />
            <a href={center.facebook} target="_blank" rel="noopener noreferrer" className="text-sunbiotan-700 hover:text-sunbiotan-900 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
              Facebook
            </a>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <button
          className="w-full py-2.5 text-[10px] tracking-[0.18em] uppercase font-medium rounded-full bg-gradient-to-r from-sunbiotan-500 to-sunbiotan-600 hover:from-sunbiotan-400 hover:to-sunbiotan-500 text-white transition-all duration-300 hover:shadow-md hover:shadow-sunbiotan-400/20 hover:scale-[1.02]"
          style={{ touchAction: 'manipulation' }}
          onClick={() => { onClick(); onScrollToMap(); }}
        >
          {viewOnMapLabel}
        </button>
      </div>
    </m.div>
  );
}
