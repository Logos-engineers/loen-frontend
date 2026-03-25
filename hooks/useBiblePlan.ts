/**
 * useBiblePlan.ts
 * 성경 통독 진행상태 관리 훅.
 * AsyncStorage 저장 키: 'LOEN_BIBLE_PLAN_v1'
 *
 * 상태 구조:
 * {
 *   readChapters: { "GEN": { "1": "2026-03-20" } },
 *   lastModified: "2026-03-20",
 *   weeklyGoal: 7,
 *   weeklyGoalDays: 7,
 *   weeklyGoalChapters: 1,
 *   selectedBookCode: "GEN",
 *   alarms: [{ id, hour, minute, days, enabled, notifIds }]
 * }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  TOTAL_CHAPTERS,
  WEEKLY_GOAL_DAYS,
  WEEKLY_GOAL_CHAPTERS,
  WEEKLY_GOAL_CHAPTERS_PER_DAY,
} from '@/constants/BibleMeta';

// ─── 타입 ───────────────────────────────────────────────────────────
/** 요일별 반복 알림 1개 */
export type AlarmItem = {
  id: string;           // 고유 ID (Date.now().toString())
  hour: number;         // 0–23
  minute: number;       // 0–59
  days: number[];       // [0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토]
  enabled: boolean;
  notifIds: string[];   // expo-notifications identifier 목록
};

export type ReadChapters = {
  [bookCode: string]: {
    [chapterNum: string]: string; // "YYYY-MM-DD"
  };
};

export type BiblePlanData = {
  readChapters: ReadChapters;
  lastModified: string;
  weeklyGoal: number;               // 총합 (= weeklyGoalDays × weeklyGoalChapters)
  weeklyGoalDays: number;           // 주당 읽을 일 수
  weeklyGoalChapters: number;       // 하루 읽을 장 수
  selectedBookCode: string | null;  // 목표 설정에서 선택한 성경책
  alarms: AlarmItem[];              // 설정된 알림 목록
};

const STORAGE_KEY = 'LOEN_BIBLE_PLAN_v1';

const DEFAULT_DATA: BiblePlanData = {
  readChapters: {},
  lastModified: '',
  weeklyGoal: WEEKLY_GOAL_CHAPTERS,
  weeklyGoalDays: WEEKLY_GOAL_DAYS,
  weeklyGoalChapters: WEEKLY_GOAL_CHAPTERS_PER_DAY,
  selectedBookCode: null,
  alarms: [],
};

let globalPlanData: BiblePlanData = {
  ...DEFAULT_DATA,
  lastModified: getLocalDateString(),
};
let globalIsLoading = true;
let didInit = false;
const listeners = new Set<() => void>();

// ─── 날짜 유틸 ──────────────────────────────────────────────────────
function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return getLocalDateString(monday);
}

function buildStats(planData: BiblePlanData) {
  const today = getLocalDateString();
  const weekStart = getWeekStartDate();
  let totalRead = 0;
  let todayRead = 0;
  let weekRead = 0;

  for (const bookCode in planData.readChapters) {
    for (const chapterKey in planData.readChapters[bookCode]) {
      const date = planData.readChapters[bookCode][chapterKey];
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
    weeklyGoalDays: planData.weeklyGoalDays,
    weeklyGoalChapters: planData.weeklyGoalChapters,
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

async function loadPlanData() {
  if (didInit) return;
  didInit = true;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BiblePlanData>;
      globalPlanData = migrate(parsed);
    }
  } catch (e) {
    console.warn('[useBiblePlan] 불러오기 실패', e);
  } finally {
    globalIsLoading = false;
    emitChange();
  }
}

// ─── 마이그레이션 ────────────────────────────────────────────────────
function migrate(parsed: Partial<BiblePlanData>): BiblePlanData {
  return {
    ...DEFAULT_DATA,
    ...parsed,
    weeklyGoalDays: parsed.weeklyGoalDays ?? WEEKLY_GOAL_DAYS,
    weeklyGoalChapters: parsed.weeklyGoalChapters ?? WEEKLY_GOAL_CHAPTERS_PER_DAY,
    selectedBookCode: parsed.selectedBookCode ?? null,
    alarms: parsed.alarms ?? [],
  };
}

// ─── 훅 ─────────────────────────────────────────────────────────────
export function useBiblePlan() {
  const [planData, setPlanData] = useState<BiblePlanData>(globalPlanData);
  const [isLoading, setIsLoading] = useState(globalIsLoading);

  useEffect(() => {
    const sync = () => {
      setPlanData(globalPlanData);
      setIsLoading(globalIsLoading);
    };

    listeners.add(sync);
    sync();
    loadPlanData();

    return () => {
      listeners.delete(sync);
    };
  }, []);

  // ── 저장 ─────────────────────────────────────────────────────────
  const save = useCallback(async (next: BiblePlanData) => {
    const previous = globalPlanData;
    globalPlanData = next;
    globalIsLoading = false;
    emitChange();

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      globalPlanData = previous;
      emitChange();
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
        delete newBookChapters[key];
      } else {
        newBookChapters[key] = today;
      }
      await save({
        ...planData,
        readChapters: { ...planData.readChapters, [bookCode]: newBookChapters },
        lastModified: today,
      });
    },
    [planData, save]
  );

  // ── 여러 장 일괄 저장 (모달 완료 버튼) ───────────────────────────
  const saveSelectedChapters = useCallback(
    async (bookCode: string, selectedChapters: number[]) => {
      const today = getLocalDateString();
      const newBookChapters: { [ch: string]: string } = {};
      for (const ch of selectedChapters) {
        newBookChapters[String(ch)] =
          planData.readChapters[bookCode]?.[String(ch)] ?? today;
      }
      await save({
        ...planData,
        readChapters: { ...planData.readChapters, [bookCode]: newBookChapters },
        lastModified: today,
      });
    },
    [planData, save]
  );

  // ── 주간 목표 저장 ────────────────────────────────────────────────
  const saveWeeklyGoal = useCallback(
    async (days: number, chaptersPerDay: number) => {
      await save({
        ...planData,
        weeklyGoal: days * chaptersPerDay,
        weeklyGoalDays: days,
        weeklyGoalChapters: chaptersPerDay,
      });
    },
    [planData, save]
  );

  // ── 성경책 선택 저장 ──────────────────────────────────────────────
  const saveSelectedBook = useCallback(
    async (bookCode: string | null) => {
      await save({ ...planData, selectedBookCode: bookCode });
    },
    [planData, save]
  );

  // ── 알림 목록 자체 저장 (전체 덮어쓰기) ──────────────────────────────────
  const saveAlarms = useCallback(
    async (alarms: AlarmItem[]) => {
      await save({ ...planData, alarms });
    },
    [planData, save]
  );

  // ── 알림 즉시 동기화 Helper Functions ──────────────────────────────
  // 알림을 조작하는 즉시 AsyncStorage에 저장하여 유령 알람을 방지합니다.
  
  const addAlarm = useCallback(
    async (newAlarm: AlarmItem) => {
      const nextAlarms = [...planData.alarms, newAlarm];
      await save({ ...planData, alarms: nextAlarms });
    },
    [planData, save]
  );

  const removeAlarm = useCallback(
    async (id: string) => {
      const nextAlarms = planData.alarms.filter((a) => a.id !== id);
      await save({ ...planData, alarms: nextAlarms });
    },
    [planData, save]
  );

  const toggleAlarm = useCallback(
    async (id: string, enabled: boolean) => {
      const nextAlarms = planData.alarms.map((a) => 
        a.id === id ? { ...a, enabled } : a
      );
      await save({ ...planData, alarms: nextAlarms });
    },
    [planData, save]
  );

  // ── 목표 + 알림 통합 저장 (완료 시 한 번에) ─────────────────────
  const saveGoalAndAlarms = useCallback(
    async (
      days: number,
      chaptersPerDay: number,
      bookCode: string | null,
      alarms: AlarmItem[]
    ) => {
      await save({
        ...planData,
        weeklyGoal: days * chaptersPerDay,
        weeklyGoalDays: days,
        weeklyGoalChapters: chaptersPerDay,
        selectedBookCode: bookCode,
        alarms,
      });
    },
    [planData, save]
  );

  // ── 통계 계산 ─────────────────────────────────────────────────────
  const stats = buildStats(planData);

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
    saveWeeklyGoal,
    saveSelectedBook,
    saveAlarms,
    addAlarm,
    removeAlarm,
    toggleAlarm,
    saveGoalAndAlarms,
    getReadChaptersForBook,
  };
}
