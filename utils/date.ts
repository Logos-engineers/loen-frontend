export function formatShortDate(isoStr: string): string {
  const [y, m, d] = isoStr.split('-');
  return `${y.slice(2)}.${m}.${d}`;
}

export function formatYearMonth(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}.${m}`;
}

export function toDateString(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function formatKoreanDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  return `${y}년 ${m}월 ${d}일`;
}

export function formatWeekLabel(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return '';
  const [, m, d] = parts;
  const weekNum = Math.ceil(d / 7);
  return `${m}월 ${weekNum}째주`;
}
