export type BeachStatus = 'free' | 'normal' | 'busy' | 'unknown';

export interface Beach {
  id: string;
  code: string;
  name: string;
  status: BeachStatus;
  latitude: number;
  longitude: number;
  updatedAt?: number | string;

  tag?: string | null;
  isFavorite?: boolean;
}
