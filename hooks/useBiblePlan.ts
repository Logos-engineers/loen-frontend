/**
 * useBiblePlan.ts
 * 성경 통독 진행상태 관리 훅.
 * AsyncStorage 저장 키: 'LOEN_BIBLE_PLAN_v1'
 *
 * 상태 구조:
 * {
 *   readChapters: {
 *     "GEN": { "1": "2026-03-20", "2": "2026-03-20" },
 *     "EXO": { "1": "2026-03-18" }
 *   },
 *   lastModified: "2026-03-20",
 *   weeklyGoal: 7
 * }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { TOTAL_CHAPTERS, WEEKLY_GOAL_CHAPTERS } from '@/constants/BibleMeta';

// ─── 타입 ───────────────────────────────────────────────────────────
export type ReadChapters = {
  [bookCode: string]: {
    [chapterNum: string]: string; // "YYYY-MM-DD"
  };
};

export type BiblePlanData = {
  readChapters: ReadChapters;
  lastModified: string;
  weeklyGoal: number;
};

const STORAGE_KEY = 'LOEN_BIBLE_PLAN_v1';

// ─── 날짜 유틸 ──────────────────────────────────────────────────────
/** 기기 로컬 기준 'YYYY-MM-DD' */
function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 기기 로컬 기준 월요일 날짜 (이번 주 시작) */
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay(); // 0=일, 1=월 ... 6=토
  const diff = day === 0 ? -6 : 1 - day; // 일요일이면 -6, 나머지는 1 - day
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return getLocalDateString(monday);
}

// ─── 훅 ─────────────────────────────────────────────────────────────
export function useBiblePlan() {
  const [planData, setPlanData] = useState<BiblePlanData>({
    readChapters: {},
    lastModified: getLocalDateString(),
    weeklyGoal: WEEKLY_GOAL_CHAPTERS,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ── 불러오기 ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as BiblePlanData;
          setPlanData(parsed);
        }
      } catch (e) {
        console.warn('[useBiblePlan] 불러오기 실패', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── 저장 ─────────────────────────────────────────────────────────
  const save = useCallback(async (next: BiblePlanData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPlanData(next);
    } catch (e) {
      console.warn('[useBiblePlan] 저장 실패', e);
    }
  }, []);

  // ── 장 읽음 토글 ─────────────────────────────────────────────────
  const toggleChapter = useCallback(
    async (bookCode: string, chapterNum: number) => {
      const key = String(chapterNum);
      const today = getLocalDateString();

      const bookChapters = planData.readChapters[bookCode] ?? {};
      const newBookChapters = { ...bookChapters };

      if (newBookChapters[key]) {
        // 이미 읽음 → 해제
        delete newBookChapters[key];
      } else {
        // 읽음 처리
        newBookChapters[key] = today;
      }

      const nextData: BiblePlanData = {
        ...planData,
        readChapters: {
          ...planData.readChapters,
          [bookCode]: newBookChapters,
        },
        lastModified: today,
      };

      await save(nextData);
    },
    [planData, save]
  );

  // ── 여러 장 일괄 저장 (모달 완료 버튼) ───────────────────────────
  const saveSelectedChapters = useCallback(
    async (bookCode: string, selectedChapters: number[]) => {
      const today = getLocalDateString();
      const newBookChapters: { [ch: string]: string } = {};
      for (const ch of selectedChapters) {
        // 기존 날짜 유지, 새로 선택된 장은 오늘 날짜
        newBookChapters[String(ch)] =
          planData.readChapters[bookCode]?.[String(ch)] ?? today;
      }

      const nextData: BiblePlanData = {
        ...planData,
        readChapters: {
          ...planData.readChapters,
          [bookCode]: newBookChapters,
        },
        lastModified: today,
      };

      await save(nextData);
    },
    [planData, save]
  );

  // ── 통계 계산 ─────────────────────────────────────────────────────
  const stats = (() => {
    const today = getLocalDateString();
    const weekStart = getWeekStartDate();

    let totalRead = 0;
    let todayRead = 0;
    let weekRead = 0;

    for (const bookCode in planData.readChapters) {
      for (const ch in planData.readChapters[bookCode]) {
        const date = planData.readChapters[bookCode][ch];
        totalRead++;
        if (date === today) todayRead++;
        if (date >= weekStart && date <= today) weekRead++;
      }
    }

    return {
      totalRead,
      totalChapters: TOTAL_CHAPTERS,
      todayRead,
      weekRead,
      weeklyGoal: planData.weeklyGoal,
    };
  })();

  // ── 책별 읽은 장 번호 배열 ────────────────────────────────────────
  const getReadChaptersForBook = useCallback(
    (bookCode: string): number[] => {
      const bookData = planData.readChapters[bookCode];
      if (!bookData) return [];
      return Object.keys(bookData).map(Number);
    },
    [planData]
  );

  return {
    isLoading,
    planData,
    stats,
    toggleChapter,
    saveSelectedChapters,
    getReadChaptersForBook,
  };
}
