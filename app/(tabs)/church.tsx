import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useOikos } from '@/hooks/useOikos';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChurchScreen() {
  const { oikos, isLoading, error } = useOikos();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>교회생활</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !oikos ? (
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>아직 오이코스가 없어요</Text>
          <Text style={styles.emptyDesc}>담당 리더에게 오이코스 초대를 요청해보세요</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 오이코스 헤더 */}
          <View style={styles.oikosCard}>
            <Text style={styles.oikosName}>{oikos.name}</Text>
            <View style={styles.leaderRow}>
              <Text style={styles.leaderLabel}>리더</Text>
              <Text style={styles.leaderName}>{oikos.leaderName}</Text>
              {oikos.sleaderName && (
                <>
                  <Text style={styles.leaderLabel}>  부리더</Text>
                  <Text style={styles.leaderName}>{oikos.sleaderName}</Text>
                </>
              )}
            </View>
          </View>

          {/* 멤버 목록 */}
          <Text style={styles.sectionTitle}>멤버 ({oikos.members.length}명)</Text>
          <View style={styles.memberList}>
            {oikos.members.map((member) => (
              <View key={member.uid} style={styles.memberRow}>
                {member.profileImage ? (
                  <Image source={{ uri: member.profileImage }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text.primary, textAlign: 'center' },
  emptyDesc: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  oikosCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  oikosName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderLabel: { fontSize: fontSize.sm, color: colors.text.secondary },
  leaderName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.secondary, marginTop: spacing.sm },
  memberList: { gap: spacing.sm },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  memberName: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
});
