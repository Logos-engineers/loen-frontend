import { AttendanceWeek } from '@/components/mypage/attendance-week';
import { NoteLog } from '@/components/mypage/note-log';
import { ProfileHeader } from '@/components/mypage/profile-header';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { useAttendanceWeek } from '@/hooks/useAttendance';
import { useOikos } from '@/hooks/useOikos';
import { useProfile } from '@/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 마이페이지 — 하단 탭 루트(뒤로가기 없음). 헤더 우측 ⚙️로 설정 진입.
export default function MyPageScreen() {
  const { profile, refetch: refetchProfile } = useProfile();
  const { oikos, refetch: refetchOikos } = useOikos();
  const { week, refetch: refetchWeek } = useAttendanceWeek();

  // 프로필 수정·오이코스 가입 등 후 돌아왔을 때 최신 값 반영
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchWeek();
      refetchOikos();
    }, [refetchProfile, refetchWeek, refetchOikos]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity onPress={() => router.push('/mypage/settings')} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 프로필 */}
        <ProfileHeader
          nickname={profile?.nickname}
          name={profile?.name}
          oikosName={oikos?.name}
          bio={profile?.bio}
          profileImage={profile?.profileImage}
          onEditPress={() => router.push('/mypage/edit')}
        />

        {/* 앱 출석체크 */}
        <SectionHeader title="로그인 출석체크" />
        <View style={styles.card}>
          <AttendanceWeek
            weekStart={week?.weekStart}
            today={week?.today}
            attendedDates={week?.attendedDates}
          />
        </View>

        {/* 성경통독표 버튼 */}
        <TouchableOpacity
          style={styles.planButton}
          activeOpacity={0.7}
          onPress={() => router.push('/plan')}
        >
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <Text style={styles.planButtonText}>성경통독표</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* 신앙노트 로그 */}
        <NoteLog uid={profile?.uid} />
      </ScrollView>
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
  scroll: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.background.elevated,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  planButtonText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
