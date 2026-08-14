import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';

export type WrittenDaysMap = Record<FaithNoteTab, string[]>;

const EMPTY: WrittenDaysMap = { THANKS: [], PRAYER: [], WORD: [] };

// 백엔드 응답(GET /notes/written-days)은 소문자 키 — 탭 키(THANKS/PRAYER/WORD)로 매핑한다.
type WrittenDaysResponse = { thanks: string[]; prayer: string[]; word: string[] };

/**
 * 이번 주(일~토)에 내가 각 탭 노트를 작성한 요일 집합.
 * 서버 집계라 피드 페이지네이션 로드량과 무관하게 항상 정확하다(로컬 notes 파생 방식의 부정확 문제 해결).
 * 응답이 3탭 한 번에 오므로 탭 전환은 맵 참조로 즉시 반영한다(재요청·깜빡임 없음).
 */
export function useWrittenDays() {
  const [writtenDaysMap, setWrittenDaysMap] = useState<WrittenDaysMap>(EMPTY);

  const refetchWrittenDays = useCallback(async () => {
    try {
      // weekStart 미지정 → 서버가 이번 주(KST)로 집계
      const res = await apiClient<WrittenDaysResponse>('/notes/written-days');
      setWrittenDaysMap({
        THANKS: res.thanks ?? [],
        PRAYER: res.prayer ?? [],
        WORD: res.word ?? [],
      });
    } catch (e) {
      // 실패 시 이전 값 유지 (빈 배열로 덮어써 체크가 사라지는 것 방지)
      console.warn('[useWrittenDays] 조회 실패', e);
    }
  }, []);

  useEffect(() => { refetchWrittenDays(); }, [refetchWrittenDays]);

  return { writtenDaysMap, refetchWrittenDays };
}
