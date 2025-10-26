// front/src/constants/trending.ts
import type { Beach } from '../types/beach';

/** 지표 3개 (0~100 권장) */
export type HotMetrics = {
  /** 버즈/검색량/소셜지표 등 */
  buzz: number;
  /** 방문/체류/유동 등 */
  visits: number;
  /** 이벤트/축제 가중치 */
  event: number;
};

/** 해수욕장 코드별 지표 (원하는 값으로 즉시 수정 가능) */
export const HOT_METRICS: Record<string, HotMetrics> = {
  HAEUNDAE:  { buzz: 90, visits: 95, event: 30 },
  GWANGALLI: { buzz: 85, visits: 88, event: 20 },
  SONGJEONG: { buzz: 70, visits: 72, event: 10 },
  // 필요하면 계속 추가...
};

/** 가중치 (원하면 조절 가능) */
const WEIGHTS = { buzz: 0.5, visits: 0.3, event: 0.2 };

/** updatedAt 보정(최신일수록 +) — 지표 미입력 케이스 보완 */
function recencyBoost(updatedAt: any): number {
  if (!updatedAt) return 0;
  const toMs = (v: any) => {
    if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
    if (typeof v === 'string' && /^\d+$/.test(v)) {
      const n = Number(v); return n < 1e12 ? n * 1000 : n;
    }
    const t = Date.parse(v); return Number.isNaN(t) ? 0 : t;
  };
  const ms = toMs(updatedAt);
  if (!ms) return 0;
  const hours = (Date.now() - ms) / 36e5; // 시간 경과
  // 0~100 스케일로 soft-decay (48시간 기준)
  const s = Math.max(0, 100 - (hours / 48) * 100);
  return Math.min(15, s * 0.15); // 최대 +15점
}

/** 최종 핫 점수 계산 */
export function computeTrendingScore(beach: Beach): number {
  const m = HOT_METRICS[beach.code];
  const base = m
    ? (m.buzz * WEIGHTS.buzz) + (m.visits * WEIGHTS.visits) + (m.event * WEIGHTS.event)
    : 0;
  return base + recencyBoost((beach as any).updatedAt);
}
