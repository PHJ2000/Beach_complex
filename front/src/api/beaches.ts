export interface Beach {
  id: string | number;
  name: string;
  address: string;
  distance: string;
  status: 'busy' | 'normal' | 'free';
  tags: string[];
  mapPosition: {
    x: number;
    y: number;
  };
}

const encodeCredentials = (username: string, password: string): string => {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(`${username}:${password}`);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');
  }

  throw new Error('Unable to encode credentials to base64');
};

export async function fetchBeaches(): Promise<Beach[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const username = import.meta.env.VITE_API_USER;
  const password = import.meta.env.VITE_API_PASS;

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }

  if (!username || !password) {
    throw new Error('VITE_API_USER and VITE_API_PASS must be configured');
  }

  const response = await fetch(`${baseUrl}/api/beaches`, {
    headers: {
      Authorization: `Basic ${encodeCredentials(username, password)}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch beaches: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as Beach[];
}
