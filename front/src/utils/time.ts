export function parseApiDate(
  value: number | string | Date | null | undefined
): Date | null {
  if (value == null) return null;

  // Date 인스턴스 그대로
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // 숫자 → epoch seconds/ms 구분
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value; // 1e12 미만이면 seconds로 간주
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // 숫자 문자열 → epoch seconds/ms 구분
  if (/^\d+$/.test(value)) {
    const n = Number(value);
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO 등 일반 문자열
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

export function formatKST(date: Date | null): string {
  if (!date) return '업데이트 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/** API 원시값(updatedAt 등)을 안전하게 포맷 */
export function formatUpdatedAt(
  raw: number | string | Date | null | undefined
): string {
  return formatKST(parseApiDate(raw));
}
