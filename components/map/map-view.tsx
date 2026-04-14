// components/map/map-view.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Star } from 'lucide-react';
import { Center } from '@/types/center';

interface MapViewProps {
  centers: Center[];
  onCenterSelect: (center: Center) => void;
  selectedCenter?: Center | null;
}

function MapContent({ centers, onCenterSelect, selectedCenter }: MapViewProps) {
  const map = useMap();
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
          pixelOffset={[0, -40]}
        >
          <div className="p-2 min-w-[200px] max-w-[280px]">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sunbiotan-900">
                {infoOpen.name}
              </h3>
              {infoOpen.featured && (
                <span className="text-xs bg-sunbiotan-100 text-sunbiotan-700 px-2 py-0.5 rounded-full">
                  Exclusivo
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{infoOpen.address}</p>
            <p className="text-sm font-medium text-sunbiotan-700">{infoOpen.city}</p>
            {infoOpen.phone && (
              <p className="text-xs text-gray-500 mt-2">{infoOpen.phone}</p>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${infoOpen.lat},${infoOpen.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-sunbiotan-600 hover:text-sunbiotan-800 font-medium"
            >
              Cómo llegar →
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function MapView({ centers, onCenterSelect, selectedCenter }: MapViewProps) {
  const defaultCenter = { lat: 39.6991, lng: -8.6291 };

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={6.5}
      mapId="sunbiotan-map"
      gestureHandling="greedy"
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
  );
}