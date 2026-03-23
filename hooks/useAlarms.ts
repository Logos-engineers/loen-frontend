/**
 * hooks/useAlarms.ts
 * 알림 권한 + 로컬 알림 스케줄 관리.
 *
 * WEEKLY trigger 요일 변환:
 *   우리 앱: days 배열 [0=일, 1=월, ..., 6=토]
 *   expo-notifications WEEKLY.weekday: 1=일, 2=월, ..., 7=토
 *   변환식: weekday = day + 1
 */

import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { AlarmItem } from './useBiblePlan';

// ─── 알림 표시 설정 (포그라운드 포함) ───────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Android 알림 채널 (최초 1회) ────────────────────────────────────
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('bible-plan', {
    name: '성경 통독 알림',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6561FF',
  }).catch(console.warn);
}

export function useAlarms() {

  // ── 권한 요청 (lazy) ─────────────────────────────────────────────
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });
    return status === 'granted';
  }, []);

  // ── 알람 스케줄 등록 ──────────────────────────────────────────────
  /**
   * 선택된 각 요일마다 WEEKLY 반복 알림 1개씩 등록.
   * WEEKLY trigger weekday: 1(일) ~ 7(토)
   *   → 변환: day(0=일) + 1
   *
   * @returns 등록된 notification identifier 목록
   */
  const scheduleAlarm = useCallback(
    async (alarm: Omit<AlarmItem, 'notifIds'>): Promise<string[]> => {
      const notifIds: string[] = [];

      for (const day of alarm.days) {
        // 우리 앱 day(0=일) → WEEKLY weekday(1=일)
        const weekday = (day + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '📖 성경 통독 알림',
              body: '오늘의 통독 목표를 확인해 보세요.',
              sound: true,
              ...(Platform.OS === 'android' && { channelId: 'bible-plan' }),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday,
              hour: alarm.hour,
              minute: alarm.minute,
            },
          });
          notifIds.push(id);
        } catch (e) {
          console.warn(`[useAlarms] scheduleAlarm 실패 — day:${day} weekday:${weekday}`, e);
        }
      }

      return notifIds;
    },
    []
  );

  // ── 알람 취소 ─────────────────────────────────────────────────────
  const cancelAlarm = useCallback(async (notifIds: string[]): Promise<void> => {
    await Promise.all(
      notifIds.map(id =>
        Notifications.cancelScheduledNotificationAsync(id).catch(e =>
          console.warn('[useAlarms] cancelAlarm 실패', id, e)
        )
      )
    );
  }, []);

  // ── 알람 전체 취소 ────────────────────────────────────────────────
  const cancelAllAlarms = useCallback(async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return {
    requestPermission,
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
  };
}
