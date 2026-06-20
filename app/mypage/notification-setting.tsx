import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAlarms } from '@/hooks/useAlarms';
import { registerPushToken } from '@/hooks/usePushToken';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Switch, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Android 구(舊) 아키텍처에서 LayoutAnimation 활성화(신 아키텍처는 기본 지원, 옵셔널 체이닝으로 안전).
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// 알림 설정(서버 단일 출처). pushEnabled=마스터, 나머지=카테고리별 수신 동의. (qa-bot#39)
type NotiSetting = {
  pushEnabled: boolean;
  noteComment: boolean;
  noteLike: boolean;
  oikos: boolean;
  notice: boolean;
  bibleReminder: boolean;
  attendanceReminder: boolean;
};

// 마스터가 켜졌을 때 노출되는 세분화 토글(순서).
const NOTI_CATEGORIES: { key: keyof Omit<NotiSetting, 'pushEnabled'>; label: string }[] = [
  { key: 'noteComment', label: '댓글' },
  { key: 'noteLike', label: '좋아요' },
  { key: 'oikos', label: '오이코스' },
  { key: 'notice', label: '공지·교안' },
  { key: 'bibleReminder', label: '성경 통독 리마인더' },
  { key: 'attendanceReminder', label: '출석 리마인더' },
];

const DEFAULT_NOTI: NotiSetting = {
  pushEnabled: false,
  noteComment: true,
  noteLike: true,
  oikos: true,
  notice: true,
  bibleReminder: true,
  attendanceReminder: true,
};

export default function NotificationSettingScreen() {
  const { requestPermission } = useAlarms();
  const [noti, setNoti] = useState<NotiSetting>(DEFAULT_NOTI);

  // 서버가 알림 설정의 단일 출처. 마운트 시 현재 값을 불러온다.
  useEffect(() => {
    let active = true;
    apiClient<NotiSetting>('/users/me/notification-setting')
      .then((data) => {
        if (active && data) setNoti({ ...DEFAULT_NOTI, ...data });
      })
      .catch(() => {
        // 조회 실패 시 기본값 유지(마스터 off), 변경 시 서버에 다시 시도.
      });
    return () => {
      active = false;
    };
  }, []);

  // 설정 전체를 서버에 저장(낙관적 업데이트 + 실패 롤백). 요청 본문은 항상 7개 필드 전부 보낸다.
  const persistNoti = async (next: NotiSetting, prev: NotiSetting, afterEnable?: boolean) => {
    setNoti(next);
    try {
      await apiClient('/users/me/notification-setting', {
        method: 'PATCH',
        body: JSON.stringify(next),
      });
      // 마스터를 켰을 땐 이 기기의 푸시 토큰이 서버에 등록돼 있도록 보장한다.
      if (afterEnable) await registerPushToken();
    } catch (e) {
      setNoti(prev); // 실패 시 롤백
      console.warn('[notification-setting] 알림 설정 변경 실패', e);
    }
  };

  // 마스터 토글 — 켤 때는 OS 권한이 먼저 있어야 실제 푸시가 도달한다.
  const handleToggleMaster = async (next: boolean) => {
    if (next) {
      const granted = await requestPermission();
      if (!granted) return; // 권한 거부 시 off 유지
    }
    // 카테고리 목록이 부드럽게 나타나고/사라지도록.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await persistNoti({ ...noti, pushEnabled: next }, noti, next);
  };

  // 카테고리 토글 — 마스터가 이미 켜진 상태에서만 노출된다.
  const handleToggleCategory =
    (key: keyof Omit<NotiSetting, 'pushEnabled'>) => async (next: boolean) => {
      await persistNoti({ ...noti, [key]: next }, noti);
    };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        {/* 마스터 */}
        <View style={styles.group}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>알림 받기</Text>
            <Switch
              value={noti.pushEnabled}
              onValueChange={handleToggleMaster}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* 세부 카테고리 — 마스터 ON일 때만 노출 */}
        {noti.pushEnabled && (
          <>
            <Text style={styles.sectionLabel}>세부 설정</Text>
            <View style={styles.group}>
              {NOTI_CATEGORIES.map((c, i) => (
                <View key={c.key}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{c.label}</Text>
                    <Switch
                      value={noti[c.key]}
                      onValueChange={handleToggleCategory(c.key)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.white}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSpacer: { width: 24 },
  body: { padding: spacing.md, gap: spacing.sm },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
  group: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  rowLabel: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
});
