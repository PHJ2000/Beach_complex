import { Beach, BeachStatus } from '../types/beach';

const STATUS_MAP: Record<string, BeachStatus> = {
  busy: 'busy',
  normal: 'normal',
  free: 'free',
  open: 'normal',      // ★ 백엔드의 OPEN → normal 로 매핑
  closed: 'unknown',   // 필요시 다른 값으로
};

const toStatus = (value: unknown): BeachStatus => {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();
  return STATUS_MAP[normalized] ?? 'unknown';
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return Number.NaN;
};

const toISOString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  return '';
};

export const fetchBeaches = async (signal?: AbortSignal): Promise<Beach[]> => {
  const response = await fetch('/api/beaches', { signal });

  if (!response.ok) {
    throw new Error('Failed to load beaches');
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item: any) => ({
    id: typeof item.id === 'string' ? item.id : String(item.id ?? ''),
    code: typeof item.code === 'string' ? item.code : '',
    name: typeof item.name === 'string' ? item.name : '',
    status: toStatus(item.status),
    latitude: toNumber(item.latitude),
    longitude: toNumber(item.longitude),
    updatedAt: toISOString(item.updatedAt),

    tag: typeof item.tag === 'string' ? item.tag : null,
    isFavorite: Boolean(item.isFavorite),
  }));
};
export interface Beach {
  id: string;
  apiId?: string;
  name: string;
  address: string;
  distance: string;
  status: 'busy' | 'normal' | 'free';
  tags: string[];
  mapPosition: {
    x: number; // percentage from left (0-100)
    y: number; // percentage from top (0-100)
  };
}

const telemetryOverrides: Record<string, string | undefined> = {
  haeundae: import.meta.env.VITE_BEACH_ID_HAEUNDAE as string | undefined,
  gwanganli: import.meta.env.VITE_BEACH_ID_GWANGANLI as string | undefined,
  songjeong: import.meta.env.VITE_BEACH_ID_SONGJEONG as string | undefined,
  dadaepo: import.meta.env.VITE_BEACH_ID_DADAEPO as string | undefined,
  songdo: import.meta.env.VITE_BEACH_ID_SONGDO as string | undefined,
  ilgwang: import.meta.env.VITE_BEACH_ID_ILGWANG as string | undefined,
  imrang: import.meta.env.VITE_BEACH_ID_IMRANG as string | undefined,
};

export const beaches: Beach[] = [
  {
    id: 'haeundae',
    apiId: telemetryOverrides.haeundae,
    name: '해운대해수욕장',
    address: '부산 해운대구',
    distance: '2.5km',
    status: 'busy',
    tags: ['popular', 'festival'],
    mapPosition: { x: 70, y: 45 }, // 동쪽 중앙
  },
  {
    id: 'gwanganli',
    apiId: telemetryOverrides.gwanganli,
    name: '광안리해수욕장',
    address: '부산 수영구',
    distance: '3.2km',
    status: 'free',
    tags: ['popular'],
    mapPosition: { x: 55, y: 50 }, // 중앙
  },
  {
    id: 'songjeong',
    apiId: telemetryOverrides.songjeong,
    name: '송정해수욕장',
    address: '부산 해운대구',
    distance: '5.8km',
    status: 'busy',
    tags: ['trending'],
    mapPosition: { x: 75, y: 30 }, // 동쪽 북쪽
  },
  {
    id: 'dadaepo',
    apiId: telemetryOverrides.dadaepo,
    name: '다대포해수욕장',
    address: '부산 사하구',
    distance: '12.3km',
    status: 'busy',
    tags: ['festival'],
    mapPosition: { x: 20, y: 70 }, // 서쪽 남쪽
  },
  {
    id: 'songdo',
    apiId: telemetryOverrides.songdo,
    name: '송도해수욕장',
    address: '부산 서구',
    distance: '8.1km',
    status: 'normal',
    tags: ['trending'],
    mapPosition: { x: 35, y: 55 }, // 중앙 서쪽
  },
  {
    id: 'ilgwang',
    apiId: telemetryOverrides.ilgwang,
    name: '일광해수욕장',
    address: '부산 기장군',
    distance: '15.6km',
    status: 'busy',
    tags: [],
    mapPosition: { x: 80, y: 20 }, // 동쪽 최북단
  },
  {
    id: 'imrang',
    apiId: telemetryOverrides.imrang,
    name: '임랑해수욕장',
    address: '부산 기장군',
    distance: '18.2km',
    status: 'busy',
    tags: ['trending'],
    mapPosition: { x: 85, y: 15 }, // 동쪽 최북단 (일광보다 더)
  },
];
