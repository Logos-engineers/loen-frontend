import { FaithNoteCard, FaithNoteItem } from '@/components/faith-note/faith-note-card';
import { FaithNoteHeader } from '@/components/faith-note/faith-note-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { faithNoteStore } from '@/utils/faith-note-store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 댓글 타입 ────────────────────────────────────────────────────────────────

interface CommentItem {
  id: string;
  author: { handle: string; name: string; initial: string };
  timeAgo: string;
  text: string;
}

const MOCK_COMMENTS: Record<string, CommentItem[]> = {
  'thanks-4': [
    {
      id: 'c1',
      author: { handle: 'Tabo1234', name: '이윤재', initial: '이' },
      timeAgo: '방금',
      text: '화이팅!! 오늘도 감사한 하루 되세요 ☀️',
    },
  ],
  'thanks-5': [
    {
      id: 'c1',
      author: { handle: 'Tabo1234', name: '이은재', initial: '이' },
      timeAgo: '방금',
      text: '👍 응원합니다!',
    },
    {
      id: 'c2',
      author: { handle: 'yonipark', name: '박채연', initial: '박' },
      timeAgo: '1분',
      text: '화이팅!! 오늘도 감사한 하루 되세요',
    },
  ],
};

// ─── 기본 fallback 노트 ────────────────────────────────────────────────────────
const FALLBACK_NOTE: FaithNoteItem = {
  id: 'thanks-1',
  tab: 'THANKS',
  author: { handle: 'potatolov_er', name: '남현서', hasAvatar: false, initial: '남' },
  timeAgo: '38분',
  content: ['오늘도 숨 쉴 수 있음에 감사', '맛있는 점심식사 감사', '일 할 수 있어서 감사^^'],
  likeCount: 0,
  commentCount: 0,
  isLiked: false,
};

// ─── CommentRow ───────────────────────────────────────────────────────────────

function CommentRow({ item }: { item: CommentItem }) {
  return (
    <View style={styles.commentRow}>
      {/* 아바타 */}
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{item.author.initial}</Text>
      </View>

      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <View style={styles.commentMeta}>
            <Text style={styles.commentHandle}>{item.author.handle}</Text>
            <Text style={styles.commentName}>{item.author.name}</Text>
          </View>
          <Text style={styles.commentTime}>{item.timeAgo}</Text>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FaithNoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // 스토어에서 노트 찾기
  const storeNotes = faithNoteStore.getNotes();
  const initialNote = storeNotes.find((n) => n.id === id) ?? FALLBACK_NOTE;

  // 로컬 노트 상태 (이 화면 안에서 좋아요 토글)
  const [note, setNote] = useState<FaithNoteItem>(initialNote);
  const [comments, setComments] = useState<CommentItem[]>(MOCK_COMMENTS[id ?? ''] ?? []);

  // 댓글 입력 상태
  const [commentText, setCommentText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 하트: 텍스트와 무관하게 사용자가 직접 누를 때만 활성화
  const [isHeartActive, setIsHeartActive] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const hasText = commentText.trim().length > 0;

  // 좋아요 토글 (로컬 + 스토어)
  const handleLikeToggle = (noteId: string) => {
    faithNoteStore.toggleLike(noteId);
    setNote((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
  };

  // 댓글 등록
  const handleSubmit = () => {
    if (!hasText) return;
    const newComment: CommentItem = {
      id: `c${Date.now()}`,
      author: { handle: '나', name: '나', initial: '나' },
      timeAgo: '방금',
      text: commentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    inputRef.current?.blur();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      {/* 이 화면에서는 "노트 작성하기" 버튼 없음 (헤더 텍스트만 표시) */}
      <FaithNoteHeader />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 원글 카드 — isDetailScreen=true로 댓글 버튼 재진입 방지 */}
          <FaithNoteCard
            item={note}
            onLikeToggle={handleLikeToggle}
            isDetailScreen
          />

          {/* ── 댓글 목록 */}
          {comments.length === 0 ? (
            <View style={styles.emptyComment}>
              <Text style={styles.emptyCommentText}>첫 댓글을 남겨보세요</Text>
            </View>
          ) : (
            <View style={styles.commentList}>
              {comments.map((c) => (
                <CommentRow key={c.id} item={c} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* ── 하단 댓글 입력창 */}
        {/* Figma: bg:#FFF, border-top:1px, px:16, py:10, gap:8 */}
        <View style={styles.inputBar}>
          {/*
           * 하트 버튼 — 사용자가 직접 눌렀을 때만 활성화
           * 텍스트 입력과 연동하지 않음 (Req 4,5)
           */}
          <TouchableOpacity
            onPress={() => setIsHeartActive((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isHeartActive ? 'heart' : 'heart-outline'}
              size={22}
              color={isHeartActive ? colors.reaction.red : colors.text.secondary}
            />
          </TouchableOpacity>

          {/* 텍스트 입력 */}
          <TextInput
            ref={inputRef}
            style={[styles.input, isInputFocused && styles.inputFocused]}
            value={commentText}
            onChangeText={setCommentText}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="댓글을 입력해주세요"
            placeholderTextColor={colors.text.secondary}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />

          {/* 등록 버튼 */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!hasText}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.submitText, hasText && styles.submitTextActive]}>등록</Text>
          </TouchableOpacity>
        </View>

        {/* iOS SafeArea 하단 여백 */}
        <View style={{ height: Platform.OS === 'ios' ? 0 : 4 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  // ── 빈 댓글
  emptyComment: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyCommentText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },

  // ── 댓글 목록 컨테이너
  commentList: {
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  // ── 댓글 Row
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  commentBody: { flex: 1, gap: 4 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentMeta: { flex: 1 },
  commentHandle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  commentName: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  commentTime: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  commentText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    lineHeight: 20,
  },

  // ── 하단 입력창
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  inputFocused: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  submitTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
