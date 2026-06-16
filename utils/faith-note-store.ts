/** 오늘 요일 키 반환 (e.g., 'WED') */
export function getTodayKey(): string {
  const keys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return keys[new Date().getDay()] ?? 'MON';
}

/** 이번 주 시작(월요일 00:00) 시각 반환 — 주간 뷰 '이번 주 작성' 판별용 */
export function getWeekStart(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const offset = (d.getDay() + 6) % 7; // 월=0, 화=1 … 일=6
  d.setDate(d.getDate() - offset);
  return d;
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
