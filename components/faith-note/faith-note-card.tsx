import BottomSheet from '@/components/ui/overlay/BottomSheet';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FaithNoteTab } from './faith-note-tab-bar';

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface FaithNoteItem {
  id: string;
  tab: FaithNoteTab;
  dayKey?: string;             // 'MON' | 'TUE' | ... (목 데이터 요일 필터용)
  createdAt?: string;          // 원본 작성 시각 (주간 뷰 '작성한 날' 판별용)
  author: {
    handle: string;
    name: string;
    nickname: string;
    hasAvatar: boolean;
    initial: string;
    imageUri?: string | null;
  };
  timeAgo: string;
  content: string[];           // 감사/기도: 번호 아이템, 말씀: 단락 (빈 string = 빈 줄)
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine?: boolean;            // 내 노트 여부 (true일 때만 ⋯ 수정/삭제 메뉴 노출)
  reactions?: { emoji: string; count: number; reacted: boolean }[];  // 기도노트 이모지 반응
}

// 이모지 코드 → 아이콘(라이브러리/이름)/활성 색상.
// 미선택 시 회색(#8F96A3), 선택 시 active 색으로 — 셋 다 벡터 아이콘으로 통일.
const REACTION_INACTIVE = '#8F96A3';
type ReactionIcon =
  | { lib: 'ion'; name: keyof typeof Ionicons.glyphMap; active: string }
  | { lib: 'fa5'; name: string; active: string };

const REACTION_ICON: Record<string, ReactionIcon> = {
  HEART: { lib: 'ion', name: 'heart', active: colors.reaction.red },
  FIRE: { lib: 'ion', name: 'flame', active: '#FF7A00' },
  PRAY: { lib: 'fa5', name: 'praying-hands', active: colors.primary },
};

interface FaithNoteCardProps {
  item: FaithNoteItem;
  onLikeToggle?: (id: string) => void;  // 좋아요 토글 콜백 (없으면 로컬 처리)
  onReactionToggle?: (id: string, emoji: string) => void;  // 기도노트 이모지 반응 토글
  onCommentPress?: (id: string) => void;
  onEdit?: (item: FaithNoteItem) => void;   // ⋯ → 수정
  onDelete?: (item: FaithNoteItem) => void; // ⋯ → 삭제
  isDetailScreen?: boolean;              // true: 댓글 버튼 클릭 비활성화
  variant?: 'feed' | 'detail';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FaithNoteCard({
  item,
  onLikeToggle,
  onReactionToggle,
  onCommentPress,
  onEdit,
  onDelete,
  isDetailScreen,
  variant = 'feed',
}: FaithNoteCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  // 내 노트 + 수정/삭제 콜백이 있을 때만 ⋯ 메뉴 노출
  const showMenu = !!item.isMine && (!!onEdit || !!onDelete);
  const isWordTab = item.tab === 'WORD';
  const primaryAuthor = item.author.nickname || item.author.name;
  const secondaryAuthor = item.author.nickname && item.author.nickname !== item.author.name ? item.author.name : '';
  const hasLikeCount = item.likeCount > 0;
  const hasCommentCount = item.commentCount > 0;
  const isDetailVariant = variant === 'detail';

  const handleLike = () => {
    onLikeToggle?.(item.id);
  };

  const handleComment = () => {
    if (onCommentPress) {
      onCommentPress(item.id);
      return;
    }
    if (isDetailScreen) return;  // 상세화면 내에서는 중복 탐색 금지
    router.push({
      pathname: '/faith-note/[id]',
      params: {
        id: item.id,
        tab: item.tab,
        handle: item.author.handle,
        name: item.author.name,
        initial: item.author.initial,
        imageUri: item.author.imageUri ?? '',
        timeAgo: item.timeAgo,
        content: JSON.stringify(item.content),
        likeCount: String(item.likeCount),
        commentCount: String(item.commentCount),
        isLiked: item.isLiked ? '1' : '0',
      },
    });
  };

  return (
    <View style={[styles.card, isDetailVariant && styles.cardDetail]}>
      <View style={styles.headerRow}>
        {item.author.imageUri ? (
          <Image source={{ uri: item.author.imageUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{item.author.initial}</Text>
          </View>
        )}

        <View style={styles.authorCol}>
          <View style={styles.nameRow}>
            <Text style={styles.handle} numberOfLines={1}>{primaryAuthor}</Text>
            <Text style={styles.timeAgo} numberOfLines={1}>{item.timeAgo}</Text>
          </View>
          {secondaryAuthor ? <Text style={styles.authorName} numberOfLines={1}>{secondaryAuthor}</Text> : null}
        </View>

        {showMenu ? (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

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
                <View style={styles.listNumberBadge}>
                  <Text style={styles.listNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.listText}>{line}</Text>
              </View>
            ))}
      </View>

      <View style={styles.footerRow}>
        {item.reactions && item.reactions.length > 0 ? (
          // 기도노트: 이모지 반응 칩
          item.reactions.map((r) => {
            const icon = REACTION_ICON[r.emoji];
            if (!icon) return null;
            const counted = r.count > 0;
            const size = counted ? 16 : 14;
            const color = r.reacted ? icon.active : REACTION_INACTIVE;
            return (
              <TouchableOpacity
                key={r.emoji}
                style={[styles.reactionChip, counted && styles.reactionChipCounted]}
                onPress={() => onReactionToggle?.(item.id, r.emoji)}
                activeOpacity={0.7}
              >
                {icon.lib === 'ion' ? (
                  <Ionicons name={icon.name} size={size} color={color} />
                ) : (
                  <FontAwesome5 name={icon.name} size={size - 1} color={color} solid />
                )}
                {counted ? <Text style={styles.reactionCount}>{r.count}</Text> : null}
              </TouchableOpacity>
            );
          })
        ) : (
          // 감사/말씀: 기존 좋아요 하트
          <TouchableOpacity
            style={[styles.reactionChip, hasLikeCount && styles.reactionChipCounted]}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart"
              size={hasLikeCount ? 16 : 14}
              color={item.isLiked ? colors.reaction.red : '#8F96A3'}
            />
            {hasLikeCount ? <Text style={styles.reactionCount}>{item.likeCount}</Text> : null}
          </TouchableOpacity>
        )}

        {/* 댓글(💬) 칩 — 상세 화면에서는 숨김 (이미 댓글 목록/입력창이 보임) */}
        {isDetailVariant ? null : (
          <TouchableOpacity
            style={[styles.reactionChip, hasCommentCount && styles.reactionChipCounted]}
            onPress={handleComment}
            activeOpacity={isDetailScreen && !onCommentPress ? 1 : 0.7}
          >
            <Ionicons name="chatbubble" size={hasCommentCount ? 16 : 14} color="#8F96A3" />
            {hasCommentCount ? <Text style={styles.reactionCount}>{item.commentCount}</Text> : null}
          </TouchableOpacity>
        )}
      </View>

      {/* ⋯ 메뉴 — 수정 / 삭제 (내 노트일 때만) */}
      <BottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)} disableContentPadding>
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.7}
          onPress={() => {
            setMenuOpen(false);
            onEdit?.(item);
          }}
        >
          <Text style={styles.menuText}>수정하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.7}
          onPress={() => {
            setMenuOpen(false);
            onDelete?.(item);
          }}
        >
          <Text style={[styles.menuText, styles.menuTextDanger]}>삭제하기</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
    overflow: 'hidden',
  },
  cardDetail: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  avatarFallback: {
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  authorCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  handle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flexShrink: 1,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  timeAgo: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  contentArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: 0,
    gap: spacing.sm,   // 항목 간 간격 8 (Figma)
  },
  contentText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 21,
  },
  emptyLine: {
    height: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
    paddingVertical: spacing.nano,   // 배지 자체 상하 패딩 2 (Figma)
  },
  listNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  listNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  listText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 21,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 12,
  },
  reactionChip: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    paddingHorizontal: 0,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(13,28,45,0.08)',
  },
  reactionChipCounted: {
    width: 'auto',
    minWidth: 46,
    flexDirection: 'row',
    gap: spacing.nano,
    paddingHorizontal: 10,
  },
  reactionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 18,
  },
  // ⋯ 메뉴 행
  menuRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  menuTextDanger: {
    color: colors.reaction.red,
  },
});
