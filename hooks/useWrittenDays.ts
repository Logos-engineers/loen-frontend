import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';

export type WrittenDaysMap = Record<FaithNoteTab, string[]>;

const EMPTY: WrittenDaysMap = { THANKS: [], PRAYER: [], WORD: [] };

// 백엔드 응답(GET /notes/written-days)은 소문자 키 — 탭 키(THANKS/PRAYER/WORD)로 매핑한다.
type WrittenDaysResponse = { thanks: string[]; prayer: string[]; word: string[] };

/** 로컬(기기 시간대) Date → 'YYYY-MM-DD'. 백엔드가 그 주의 일요일로 스냅한다. */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 보고 있는 주(일~토)에 내가 각 탭 노트를 작성한 요일 집합.
 * 서버 집계라 피드 페이지네이션 로드량과 무관하게 항상 정확하다(로컬 notes 파생 방식의 부정확 문제 해결).
 * 응답이 3탭 한 번에 오므로 **주(週)가 바뀔 때만 조회**하고, 탭 전환은 맵 참조로 즉시 반영한다(재요청·깜빡임 없음).
 */
export function useWrittenDays(weekStart: Date) {
  const [writtenDaysMap, setWrittenDaysMap] = useState<WrittenDaysMap>(EMPTY);
  // 마지막으로 요청한 주 키 — 과거 주를 빠르게 연속 이동할 때 늦게 온 응답이 최신 화면을 덮지 않게 가드.
  const latestKeyRef = useRef('');

  const refetchWrittenDays = useCallback(async () => {
    const key = toDateKey(weekStart);
    latestKeyRef.current = key;
    try {
      const res = await apiClient<WrittenDaysResponse>(`/notes/written-days?weekStart=${key}`);
      if (latestKeyRef.current !== key) return; // 그 사이 주가 바뀌었으면 stale 응답 폐기
      setWrittenDaysMap({
        THANKS: res.thanks ?? [],
        PRAYER: res.prayer ?? [],
        WORD: res.word ?? [],
      });
    } catch (e) {
      // 실패 시 이전 값 유지 (빈 배열로 덮어써 체크가 사라지는 것 방지)
      console.warn('[useWrittenDays] 조회 실패', e);
    }
  }, [weekStart]);

  // 주가 바뀌면(=weekStart 변경) 재조회. 탭 변경으로는 재조회하지 않는다.
  useEffect(() => { refetchWrittenDays(); }, [refetchWrittenDays]);

  return { writtenDaysMap, refetchWrittenDays };
}
