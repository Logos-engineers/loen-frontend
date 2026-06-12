import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { FIRE_SVG, HEART_SVG } from '@/constants/icons';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { useFaithNotes, type ReactionItem } from '@/hooks/useFaithNotes';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import type { FaithNoteItem } from '@/components/faith-note/faith-note-card';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

// 이모지 코드 → SVG/텍스트 아이콘
const REACTION_SVG: Record<string, string> = {
  HEART: HEART_SVG,
  FIRE: FIRE_SVG,
};

const REACTION_EMOJI: Record<string, string> = {
  PRAY: '🙏🏻',
};

function PrayerCard({
  item,
  onReact,
}: {
  item: FaithNoteItem;
  onReact: (id: string, emoji: string) => void;
}) {
  const display = item.author.nickname || item.author.name || '익명';
  const realName = item.author.nickname && item.author.name && item.author.name !== item.author.nickname
    ? item.author.name : '';
  return (
    <Card style={styles.prayerCard}>
      <View style={styles.topRow}>
        {/* Figma: 32px 원형 아바타 (회색 placeholder) */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{display[0]}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.name}>
            {display}
            {realName ? <Text style={styles.realName}> · {realName}</Text> : null}
          </Text>
          <Text style={styles.content}>{item.content.join('\n')}</Text>
        </View>
      </View>

      {/* 이모지 반응 태그 — icon tag h:28, radius:9, px:10 */}
      <View style={styles.reactionRow}>
        {(item.reactions ?? []).map((r: ReactionItem) => {
          const svg = REACTION_SVG[r.emoji];
          const emoji = REACTION_EMOJI[r.emoji];
          if (!svg && !emoji) return null;
          return (
            <TouchableOpacity
              key={r.emoji}
              style={[styles.reactionTag, r.reacted ? styles.reactionTagActive : styles.reactionTagDefault]}
              onPress={() => onReact(item.id, r.emoji)}
              activeOpacity={0.7}
            >
              {svg ? (
                <SvgXml xml={svg} width={16} height={16} />
              ) : (
                <Text style={[styles.reactionEmoji, !r.reacted && styles.reactionEmojiDefault]}>{emoji}</Text>
              )}
              {r.count > 0 && (
                <Text style={[styles.reactionCount, r.reacted && styles.reactionCountActive]}>{r.count}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}

export function PrayerSection() {
  const { notes, isLoading, error, toggleReaction, refetch } = useFaithNotes('PRAYER');
  useRefetchOnFocus(refetch);
  const prayers = notes.slice(0, 3);

  return (
    <View style={styles.wrapper}>
      <SectionHeader title="같이 기도해요" />
      <View style={styles.cardsWrapper}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={styles.emptyText}>기도노트를 불러오지 못했습니다</Text>
        ) : prayers.length > 0 ? prayers.map(item => (
          <PrayerCard key={item.id} item={item} onReact={toggleReaction} />
        )) : (
          <Text style={styles.emptyText}>등록된 기도노트가 없습니다</Text>
        )}
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
  realName: {
    fontWeight: fontWeight.regular,
    color: colors.text.dim,
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
  reactionEmoji: {
    fontSize: 15,
    lineHeight: 18,
  },
  reactionEmojiDefault: {
    opacity: 0.55,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
});
