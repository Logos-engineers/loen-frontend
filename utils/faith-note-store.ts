/** 오늘 요일 키 반환 (e.g., 'WED') */
export function getTodayKey(): string {
  const keys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return keys[new Date().getDay()] ?? 'MON';
}

// ─── 말씀노트 성경 선택 임시 저장 (write-word ↔ select-bible) ─────────────────

export interface BiblePassage {
  book: string;
  chapter: number;
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
