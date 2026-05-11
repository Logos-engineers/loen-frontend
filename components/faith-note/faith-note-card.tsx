import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FaithNoteTab } from './faith-note-tab-bar';

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface FaithNoteItem {
  id: string;
  tab: FaithNoteTab;
  dayKey?: string;             // 'MON' | 'TUE' | ... (목 데이터 요일 필터용)
  author: {
    handle: string;
    name: string;
    hasAvatar: boolean;
    initial: string;
  };
  timeAgo: string;
  content: string[];           // 감사/기도: 번호 아이템, 말씀: 단락 (빈 string = 빈 줄)
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface FaithNoteCardProps {
  item: FaithNoteItem;
  onLikeToggle?: (id: string) => void;  // 좋아요 토글 콜백 (없으면 로컬 처리)
  isDetailScreen?: boolean;              // true: 댓글 버튼 클릭 비활성화
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FaithNoteCard({ item, onLikeToggle, isDetailScreen }: FaithNoteCardProps) {
  const router = useRouter();
  const isWordTab = item.tab === 'WORD';

  const handleLike = () => {
    onLikeToggle?.(item.id);
  };

  const handleComment = () => {
    if (isDetailScreen) return;  // 상세화면 내에서는 중복 탐색 금지
    router.push(`/faith-note/${item.id}`);
  };

  return (
    // Figma: Card — bg:#FFF, radius:16, shadow, mx:16, mb:8
    <View style={styles.card}>
      {/* ── 카드 헤더: 아바타 + 이름 + 시간 + 더보기 */}
      <View style={styles.headerRow}>
        {/* 아바타 — 36×36 원형 */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author.initial}</Text>
        </View>

        {/* 핸들 + 실명 */}
        <View style={styles.authorCol}>
          <Text style={styles.handle}>{item.author.handle}</Text>
          <Text style={styles.authorName}>{item.author.name}</Text>
        </View>

        {/* 시간 */}
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>

        {/* 더보기 ··· */}
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* ── 본문 */}
      <View style={styles.contentArea}>
        {isWordTab
          ? item.content.map((line, idx) => (
              <Text
                key={idx}
                style={[styles.contentText, line === '' && styles.emptyLine]}
              >
                {line}
              </Text>
            ))
          : item.content.map((line, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listNumber}>{idx + 1}</Text>
                <Text style={styles.listText}>{line}</Text>
              </View>
            ))}
      </View>

      {/* ── 푸터: 좋아요 + 댓글 */}
      <View style={styles.footerRow}>
        {/* 좋아요 — 토글 */}
        <TouchableOpacity
          style={styles.reactionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={item.isLiked ? colors.reaction.red : colors.text.secondary}
          />
          {item.likeCount > 0 && (
            <Text
              style={[styles.reactionCount, item.isLiked && styles.reactionCountLiked]}
            >
              {item.likeCount}
            </Text>
          )}
        </TouchableOpacity>

        {/* 댓글 */}
        <TouchableOpacity
          style={styles.reactionButton}
          onPress={handleComment}
          activeOpacity={isDetailScreen ? 1 : 0.7}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.text.secondary} />
          {item.commentCount > 0 && (
            <Text style={styles.reactionCount}>{item.commentCount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Figma: bg:#FFF, radius:16, mx:16, mb:8, shadow
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },

  // ── 헤더
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  authorCol: {
    flex: 1,
  },
  handle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  authorName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
  },
  timeAgo: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    flexShrink: 0,
  },

  // ── 본문
  contentArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    gap: 2,
  },
  contentText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
    lineHeight: 22,
  },
  emptyLine: {
    height: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  listNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    width: 16,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
    lineHeight: 22,
  },

  // ── 푸터
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  reactionCountLiked: {
    color: colors.reaction.red,
  },
});
