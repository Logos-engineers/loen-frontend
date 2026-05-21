import { BIBLE_BOOKS as BIBLE_BOOK_META } from '@/constants/BibleMeta';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

export type ChallengeAlarm = {
  id: string;
  hour: number;
  minute: number;
  weekdays: number[];
  notificationIds: string[];
  enabled: boolean;
};

export type DurationTab = 'duration' | 'daily' | 'end';
export type TimePeriod = 'AM' | 'PM';

export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;

export const BIBLE_BOOK_NAMES: string[] = BIBLE_BOOK_META.map(b => b.korName);

export const BIBLE_CHAPTER_MAP: Record<string, number> = Object.fromEntries(
  BIBLE_BOOK_META.map(b => [b.korName, b.chapterCount])
);

export function formatSelectedBooks(selected: string[]): string {
  if (!selected || selected.length === 0) return '';
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]}, ${selected[1]}`;
  return `${selected[0]}, ${selected[1]} 외 ${selected.length - 2}권`;
}

export function getTotalChapters(selected: string[]): number {
  if (!selected) return 0;
  return selected.reduce((acc, book) => acc + (BIBLE_CHAPTER_MAP[book] || 0), 0);
}

export function formatDateFrom(date: Date): string {
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일부터`;
}

export function formatDateUntil(date: Date): string {
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일까지`;
}

export function formatTimeText(hour: number, minute: number): string {
  const isPM = hour >= 12;
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${isPM ? '오후' : '오전'} ${displayHour}:${displayMinute}`;
}

export function getWeekdayText(weekdays: number[]): string {
  if (weekdays.length === 7) return '매일';
  if (weekdays.length === 1) return `${WEEKDAYS[weekdays[0]]}요일마다`;
  return [...weekdays].sort().map(idx => WEEKDAYS[idx]).join(',') + '마다';
}

export async function deleteAlarmsById(
  alarms: ChallengeAlarm[],
  ids: string[]
): Promise<ChallengeAlarm[]> {
  for (const alarm of alarms.filter(a => ids.includes(a.id))) {
    for (const notiId of alarm.notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notiId);
      } catch {
        // 이미 취소된 알림은 무시
      }
    }
  }
  return alarms.filter(a => !ids.includes(a.id));
}

export async function scheduleWeeklyAlarm(
  hour: number,
  minute: number,
  weekdays: number[],
  content: { title: string; body: string }
): Promise<string[]> {
  const notificationIds: string[] = [];
  for (const dayIndex of weekdays) {
    const expoWeekday = dayIndex === 6 ? 1 : dayIndex + 2;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: SchedulableTriggerInputTypes.WEEKLY, hour, minute, weekday: expoWeekday },
      });
      notificationIds.push(id);
    } catch {
      // 스케줄링 실패한 요일은 건너뜀
    }
  }
  return notificationIds;
}
