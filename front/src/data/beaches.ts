import { Beach, BeachStatus } from '../types/beach';

const STATUS_MAP: Record<string, BeachStatus> = {
  busy: 'busy',
  normal: 'normal',
  free: 'free',
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
  }));
};
