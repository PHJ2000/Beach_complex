// front/src/hooks/useUserLocation.ts
import { useEffect, useState } from 'react';
import { BUSAN_CENTER } from '../utils/geo';

type Perm = 'granted' | 'denied' | 'prompt' | 'unknown';

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [perm, setPerm] = useState<Perm>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      setCoords(BUSAN_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPerm('granted');
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setPerm('denied');
        setCoords(BUSAN_CENTER); // 권한 거부 → 부산시청 기준
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return { coords, perm, error };
}
