// components/map/map-view.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Star, Phone } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useTranslations } from 'next-intl';
import { Center } from '@/types/center';

interface MapViewProps {
  centers: Center[];
  onCenterSelect: (center: Center) => void;
  selectedCenter?: Center | null;
}

function MapContent({ centers, onCenterSelect, selectedCenter }: MapViewProps) {
  const map = useMap();
  const t = useTranslations('Sidebar');
  const [infoOpen, setInfoOpen] = useState<Center | null>(null);

  // Cuando selectedCenter cambia desde afuera (sidebar), hacer zoom
  useEffect(() => {
    if (selectedCenter && map) {
      map.panTo({ lat: selectedCenter.lat, lng: selectedCenter.lng });
      map.setZoom(14);
      setInfoOpen(selectedCenter);
    }
  }, [selectedCenter, map]);

  const handleMarkerClick = useCallback((center: Center) => {
    setInfoOpen(center);
    onCenterSelect(center);
    if (map) {
      map.panTo({ lat: center.lat, lng: center.lng });
      map.setZoom(14);
    }
  }, [map, onCenterSelect]);

  return (
    <>
      {centers.map((center) => (
        <AdvancedMarker
          key={center.id}
          position={{ lat: center.lat, lng: center.lng }}
          onClick={() => handleMarkerClick(center)}
          title={center.name}
        >
          <div className={`relative cursor-pointer transition-transform hover:scale-110 ${
            center.featured ? 'animate-pulse' : ''
          }`}>
            <MapPin
              className={center.featured
                ? 'h-10 w-10 text-sunbiotan-500 drop-shadow-lg'
                : 'h-8 w-8 text-sunbiotan-600 drop-shadow-md'
              }
              fill={center.featured ? '#c19a5b' : '#d4b989'}
              strokeWidth={1.5}
            />
            {center.featured && (
              <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </AdvancedMarker>
      ))}

      {infoOpen && (
        <InfoWindow
          position={{ lat: infoOpen.lat, lng: infoOpen.lng }}
          onCloseClick={() => setInfoOpen(null)}
          pixelOffset={[0, -44]}
        >
          <div style={{ minWidth: 230, maxWidth: 280, fontFamily: 'sans-serif', padding: '4px 2px 2px' }}>

            {/* Name */}
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1c1208', marginBottom: 2, lineHeight: 1.3 }}>
              {infoOpen.name}
            </p>
            {infoOpen.featured && (
              <span style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#fdf6ec', color: '#92652a', border: '1px solid #e8d5b0', borderRadius: 999, padding: '2px 8px', marginBottom: 6, fontWeight: 500 }}>
                ★ Premium
              </span>
            )}

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8 }}>
              <MapPin style={{ width: 14, height: 14, color: '#c19a5b', flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
              <div style={{ fontSize: 12, color: '#6b4e27', lineHeight: 1.5 }}>
                <div>{infoOpen.address}</div>
                <div style={{ fontWeight: 600, color: '#4a3418' }}>{infoOpen.city}</div>
              </div>
            </div>

            {infoOpen.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Phone style={{ width: 14, height: 14, color: '#c19a5b', flexShrink: 0 }} strokeWidth={1.5} />
                <a href={`tel:${infoOpen.phone.replace(/\s/g, '')}`} style={{ fontSize: 12, color: '#6b4e27', textDecoration: 'none' }}>
                  {infoOpen.phone}
                </a>
              </div>
            )}
            {infoOpen.instagram && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <FontAwesomeIcon icon={faInstagram} style={{ width: 14, height: 14, color: '#c19a5b', flexShrink: 0 }} />
                <a href={`https://instagram.com/${infoOpen.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#6b4e27', textDecoration: 'none' }}>
                  @{infoOpen.instagram.replace('@', '')}
                </a>
              </div>
            )}
            {infoOpen.facebook && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <FontAwesomeIcon icon={faFacebook} style={{ width: 14, height: 14, color: '#c19a5b', flexShrink: 0 }} />
                <a href={infoOpen.facebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#6b4e27', textDecoration: 'none' }}>
                  Facebook
                </a>
              </div>
            )}

            {/* Button */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${infoOpen.lat},${infoOpen.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: 14,
                width: '100%',
                padding: '9px 0',
                borderRadius: 999,
                background: 'linear-gradient(to right, #c19a5b, #a87d3e)',
                color: '#fff',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              {t('viewOnMap')}
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function MapView({ centers, onCenterSelect, selectedCenter }: MapViewProps) {
  const defaultCenter = { lat: 39.6991, lng: -8.6291 };
  const t = useTranslations('Sidebar');
  const [showHint, setShowHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setShowHint(true);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setShowHint(false), 1800);
    } else {
      setShowHint(false);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
  };

  return (
    <div className="relative w-full h-full" onTouchStart={handleTouchStart}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={6.5}
        mapId="sunbiotan-map"
        gestureHandling="cooperative"
        disableDefaultUI={true}
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapContent
          centers={centers}
          onCenterSelect={onCenterSelect}
          selectedCenter={selectedCenter}
        />
      </Map>

      {/* Two-finger hint overlay — mobile only */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 md:hidden ${
          showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5 bg-[#1a130a]/80 backdrop-blur-sm text-sunbiotan-200 text-xs tracking-[0.12em] uppercase font-medium px-5 py-3 rounded-full shadow-xl">
          <span className="text-base">✌️</span>
          {t('twoFingersHint')}
        </div>
      </div>
    </div>
  );
}