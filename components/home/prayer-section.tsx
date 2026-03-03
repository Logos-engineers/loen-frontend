import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrayerItem {
  id: string;
  name: string;
  content: string;
  reactions: { emoji: string; count: number }[];
}

// 더미 데이터 — API 연동 시 props로 교체
const PRAYERS: PrayerItem[] = [
  {
    id: '1',
    name: '이윤재',
    content: '교회에 처음 온 내 친구가 잘 정착하기를',
    reactions: [
      { emoji: '❤️', count: 8 },
      { emoji: '🔥', count: 1 },
      { emoji: '👍', count: 0 },
    ],
  },
  {
    id: '2',
    name: '김서연',
    content: '이번 주 사업이 잘 되기를 기도해 주세요',
    reactions: [
      { emoji: '❤️', count: 3 },
      { emoji: '🔥', count: 2 },
      { emoji: '👍', count: 1 },
    ],
  },
];

function PrayerCard({ item }: { item: PrayerItem }) {
  return (
    <Card style={styles.prayerCard}>
      <View style={styles.row}>
        {/* 프로필 이미지 placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.content}>{item.content}</Text>
        </View>
      </View>

      {/* 반응 버튼들 */}
      <View style={styles.reactionRow}>
        {item.reactions.filter(r => r.count > 0).map((r, i) => (
          <TouchableOpacity
            key={i}
            style={styles.reactionBtn}
            onPress={() => Alert.alert(`${r.emoji} 반응 추가`)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{r.emoji}</Text>
            <Text style={styles.reactionCount}>{r.count}</Text>
          </TouchableOpacity>
        ))}
        {/* 반응 추가 버튼 */}
        <TouchableOpacity
          style={[styles.reactionBtn, styles.addReactionBtn]}
          onPress={() => Alert.alert('반응 선택')}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionEmoji}>😊</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export function PrayerSection() {
  return (
    <View style={styles.wrapper}>
      <SectionHeader title="같이 기도해요" />
      {PRAYERS.map(item => (
        <PrayerCard key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  prayerCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  content: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: 44, // avatar width + gap
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.background.base,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  addReactionBtn: {
    paddingHorizontal: spacing.sm,
  },
  reactionEmoji: {
    fontSize: fontSize.sm,
  },
  reactionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
});
