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

// 달력식 "N째주": 그 달 1일의 요일을 반영해 캘린더 그리드 기준으로 주차를 센다.
// (단순 ceil(일/7)이 아니라, 1일이 무슨 요일이냐에 따라 첫 주 길이가 달라지는 실제 달력 기준)
// dateStr = "YYYY-MM-DD". 앱 전체에서 이 함수를 유일한 주차 계산 소스로 쓴다.
export function formatWeekLabel(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return '';
  const [y, m, d] = parts;
  const firstDayOfWeek = new Date(y, m - 1, 1).getDay(); // 0=일 … 6=토
  const weekNum = Math.ceil((d + firstDayOfWeek) / 7);
  return `${m}월 ${weekNum}째주`;
}
