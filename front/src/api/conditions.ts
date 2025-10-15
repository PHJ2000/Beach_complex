export interface BeachConditionDto {
  id: string;
  beachId: string;
  observedAt: string;
  waterTemperatureCelsius: number | null;
  waveHeightMeters: number | null;
  weatherSummary: string | null;
  latitude: number | null;
  longitude: number | null;
}

const DEFAULT_API_BASE_URL = '';
const BASIC_AUTH_USERNAME = import.meta.env.VITE_API_USERNAME ?? 'beach-admin';
const BASIC_AUTH_PASSWORD = import.meta.env.VITE_API_PASSWORD ?? 'changeit';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;

function encodeBasicCredentials(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(credentials);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(credentials, 'utf-8').toString('base64');
  }

  throw new Error('Basic authentication requires a base64 encoder.');
}

function createBasicAuthHeader(): string {
  return `Basic ${encodeBasicCredentials(BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD)}`;
}

export async function fetchRecentConditions(beachId: string): Promise<BeachConditionDto[]> {
  if (!beachId) {
    return [];
  }

  const url = `${API_BASE_URL}/api/beaches/${beachId}/conditions/recent`;
  const response = await fetch(url, {
    headers: {
      Authorization: createBasicAuthHeader(),
      Accept: 'application/json',
    },
  });

  if (response.status === 404) {
    // Unknown beach identifier – treat as no available telemetry rather than surfacing an error.
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to load conditions for beach ${beachId}: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as BeachConditionDto[];
  return data.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
}
