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
