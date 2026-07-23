/** 오늘 요일 키 반환 (e.g., 'WED') */
export function getTodayKey(): string {
  const keys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return keys[new Date().getDay()] ?? 'MON';
}

/** 이번 주 시작(일요일 00:00) 시각 반환 — 주간 셀렉터(일~토)와 정합 */
export function getWeekStart(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // 일=0 … 토=6 → 일요일이 주 시작
  return d;
}

/** 주 시작(일요일 00:00)에서 n주 이동한 주의 시작 시각 */
export function addWeeks(weekStart: Date, n: number): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + n * 7);
  return d;
}

/** 주 끝(토요일 23:59:59.999) — weekStart 는 일요일 00:00 가정 */
export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** 주어진 주 시작이 '이번 주'인가 */
export function isCurrentWeek(weekStart: Date): boolean {
  return weekStart.getTime() === getWeekStart().getTime();
}

/** 주 범위 라벨. 예: "7월 20 – 26일" / 월 경계면 "7월 30일 – 8월 5일" */
export function formatWeekRangeLabel(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  const sM = weekStart.getMonth() + 1;
  const sD = weekStart.getDate();
  const eM = end.getMonth() + 1;
  const eD = end.getDate();
  return sM === eM ? `${sM}월 ${sD} – ${eD}일` : `${sM}월 ${sD}일 – ${eM}월 ${eD}일`;
}

// ─── 말씀노트 성경 선택 임시 저장 (write-word ↔ select-bible) ─────────────────

export interface BiblePassage {
  book: string;
  chapter: number;
  verses?: number[]; // 선택한 절 번호들 (말씀노트: 한 책/한 장/여러 절)
}

let _pendingPassages: BiblePassage[] = [];

export function getPendingPassages(): BiblePassage[] {
  return [..._pendingPassages];
}
export function setPendingPassages(passages: BiblePassage[]): void {
  _pendingPassages = passages;
}
export function clearPendingPassages(): void {
  _pendingPassages = [];
}
