import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { ADD_EMOJI_SVG, FIRE_SVG, HEART_SVG } from '@/constants/icons';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface ReactionTag {
  svg: string;
  count: number;
  active?: boolean;    // 활성이면 primary 배경
}

interface PrayerItem {
  id: string;
  name: string;
  content: string;
  reactions: ReactionTag[];
}

const PRAYERS: PrayerItem[] = [
  {
    id: '1',
    name: '이윤재',
    content: '교회에 처음 온 내 친구가 잘 정착하기를',
    reactions: [
      { svg: HEART_SVG, count: 8, active: true },    // #6561FF 배경
      { svg: FIRE_SVG, count: 1, active: false },
      { svg: ADD_EMOJI_SVG, count: 0, active: false },
    ],
  },
  {
    id: '2',
    name: '김서연',
    content: '이번 주 사업이 잘 되기를 기도해 주세요',
    reactions: [
      { svg: HEART_SVG, count: 3, active: true },
      { svg: FIRE_SVG, count: 2, active: false },
      { svg: ADD_EMOJI_SVG, count: 0, active: false },
    ],
  },
];

function PrayerCard({ item }: { item: PrayerItem }) {
  return (
    <Card style={styles.prayerCard}>
      <View style={styles.topRow}>
        {/* Figma: 32px 원형 아바타 (회색 placeholder) */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.content}>{item.content}</Text>
        </View>
      </View>

      {/* Figma: 반응 태그 — icon tag 스타일 h:28, radius:9, px:10 */}
      <View style={styles.reactionRow}>
        {item.reactions.map((r, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.reactionTag,
              r.active ? styles.reactionTagActive : styles.reactionTagDefault,
            ]}
            onPress={() => Alert.alert('반응')}
            activeOpacity={0.7}
          >
            {/* Figma SVG 아이콘 16×16 */}
            <SvgXml xml={r.svg} width={16} height={16} />
            {r.count > 0 && (
              <Text style={[
                styles.reactionCount,
                r.active && styles.reactionCountActive,
              ]}>
                {r.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

export function PrayerSection() {
  return (
    <View style={styles.wrapper}>
      <SectionHeader title="같이 기도해요" />
      <View style={styles.cardsWrapper}>
        {PRAYERS.map(item => (
          <PrayerCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  cardsWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  prayerCard: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,    // rgba(13,28,45,0.08) 회색 플레이스홀더
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.sm,             // 12px Medium
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  content: {
    fontSize: fontSize.base,           // 16px SemiBold
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginLeft: 40,                    // avatar(32) + gap(8) 들여쓰기
  },
  // Figma: icon tag h:28, radius:9, px:10, py:4
  reactionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reactionTagActive: {
    backgroundColor: colors.primary,   // #6561FF
  },
  reactionTagDefault: {
    backgroundColor: colors.border,    // rgba(13,28,45,0.08)
  },
  reactionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  reactionCountActive: {
    color: '#FFFFFF',
  },
});
