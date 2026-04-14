// hooks/use-geolocation.ts
'use client';

import { useState, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface GeolocationState {
  coords: Coordinates | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        error: 'Geolocalización no soportada por tu navegador',
        loading: false,
      });
      return;
    }

    setState({ coords: null, error: null, loading: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }

        setState({
          coords: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      coords: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}