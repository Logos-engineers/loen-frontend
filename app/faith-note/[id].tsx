import { FaithNoteCard, FaithNoteItem } from '@/components/faith-note/faith-note-card';
import { FaithNoteHeader } from '@/components/faith-note/faith-note-header';
import { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';
import BottomSheet from '@/components/ui/overlay/BottomSheet';
import Popup from '@/components/ui/overlay/Popup';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { normalizePrayerReactions } from '@/hooks/useFaithNotes';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { getBibleBook } from '@/constants/bibleLoader';
import { apiClient } from '@/utils/apiClient';
import { blockUser, getBlockedUsers, reportContent } from '@/utils/moderation';
import { ReportReasonSheet } from '@/components/shared/ReportReasonSheet';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

type NoteDetailParams = {
  id?: string;
  tab?: FaithNoteTab;
  handle?: string;
  name?: string;
  nickname?: string;
  initial?: string;
  imageUri?: string;
  timeAgo?: string;
  content?: string;
  likeCount?: string;
  commentCount?: string;
  isLiked?: string;
};

type ApiCommentItem = {
  commentId: string;
  userId: string;
  writerName: string;
  writerNickname: string | null;
  writerProfileImage?: string | null;
  content: string;
  createdAt: string;
  isMine: boolean;
};

type ApiCommentListResponse = {
  comments: ApiCommentItem[];
  totalCount: number;
};

type ThanksDetailResponse = {
  id: string;
  writerId: string;
  writerName: string;
  writerNickname: string | null;
  answers: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
};

type PrayerDetailResponse = {
  id: string;
  writerId: string;
  writerName: string;
  writerNickname: string | null;
  prayers: string[];
  commentCount: number;
  isMine: boolean;
  createdAt: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
};

type WordDetailResponse = {
  id: string;
  writerId: string;
  writerName: string;
  writerNickname: string | null;
  bibleName: string;
  chapter: number;
  phaseStart: number;
  phaseEnd: number;
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
};

interface CommentItem {
  id: string;
  userId: string;
  author: { handle: string; name: string; nickname: string; initial: string; imageUri?: string | null };
  timeAgo: string;
  text: string;
  isMine: boolean;
}

function parseContentParam(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function toStringValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function toIntValue(value?: string | string[], fallback = 0) {
  const parsed = Number.parseInt(toStringValue(value) ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}분`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간`;
  return `${Math.floor(hours / 24)}일`;
}

function buildFallbackNote(id?: string): FaithNoteItem {
  return {
    id: id ?? 'detail-placeholder',
    tab: 'THANKS',
    author: {
      handle: 'potatolov_er',
      name: '남현서',
      nickname: '',
      hasAvatar: false,
      initial: '남',
      imageUri: null,
    },
    timeAgo: '38분',
    content: [
      '오늘도 숨 쉴 수 있음에 감사',
      '맛있는 점심식사 감사',
      '일 할 수 있어서 감사^^',
    ],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  };
}

function toCommentItem(item: ApiCommentItem): CommentItem {
  return {
    id: item.commentId,
    userId: item.userId,
    author: {
      handle: '',
      name: item.writerName,
      nickname: item.writerNickname ?? '',
      initial: item.writerName?.[0] ?? '?',
      imageUri: item.writerProfileImage ?? null,
    },
    timeAgo: getTimeAgo(item.createdAt),
    text: item.content,
    isMine: item.isMine,
  };
}

function toThanksNote(detail: ThanksDetailResponse, fallback: FaithNoteItem): FaithNoteItem {
  return {
    id: detail.id,
    writerId: detail.writerId,
    tab: 'THANKS',
    author: {
      handle: fallback.author.handle,
      name: detail.writerName,
      nickname: detail.writerNickname ?? '',
      initial: detail.writerName?.[0] ?? fallback.author.initial,
      hasAvatar: Boolean(fallback.author.imageUri),
      imageUri: fallback.author.imageUri,
    },
    timeAgo: getTimeAgo(detail.createdAt),
    content: detail.answers,
    likeCount: detail.likeCount,
    commentCount: detail.commentCount ?? 0,
    isLiked: detail.isLiked,
    isMine: detail.isMine,
  };
}

function toPrayerNote(detail: PrayerDetailResponse, fallback: FaithNoteItem): FaithNoteItem {
  return {
    id: detail.id,
    writerId: detail.writerId,
    tab: 'PRAYER',
    author: {
      handle: fallback.author.handle,
      name: detail.writerName,
      nickname: detail.writerNickname ?? '',
      initial: detail.writerName?.[0] ?? fallback.author.initial,
      hasAvatar: Boolean(fallback.author.imageUri),
      imageUri: fallback.author.imageUri,
    },
    timeAgo: getTimeAgo(detail.createdAt),
    content: detail.prayers,
    likeCount: 0,
    commentCount: detail.commentCount ?? 0,
    isLiked: false,
    isMine: detail.isMine,
    reactions: normalizePrayerReactions(detail.reactions),
  };
}

// 선택한 절 범위(phaseStart~phaseEnd)의 성경 본문 줄을 앱 로컬 데이터에서 만든다. "1 본문…"
function buildScriptureLines(bibleName: string, chapter: number, start: number, end: number): string[] {
  const code = BIBLE_BOOKS.find((b) => b.korName === bibleName)?.code;
  if (!code || !start) return [];
  const chap = getBibleBook(code)?.chapters.find((c) => c.chapter === chapter);
  if (!chap) return [];
  return chap.verses
    .filter((v) => v.verse >= start && v.verse <= (end || start))
    .map((v) => `${v.verse} ${v.text}`);
}

function toWordNote(detail: WordDetailResponse, fallback: FaithNoteItem): FaithNoteItem {
  const verseLabel = detail.phaseEnd > detail.phaseStart ? `${detail.phaseStart}-${detail.phaseEnd}` : `${detail.phaseStart}`;
  const passageRef = `${detail.bibleName} ${detail.chapter}장 ${verseLabel}절`;
  // 상세에서는 선택한 절의 실제 성경 본문을 함께 표시한다 (참조 → 본문 → 묵상).
  const scriptureLines = buildScriptureLines(detail.bibleName, detail.chapter, detail.phaseStart, detail.phaseEnd);
  const content: string[] = [passageRef];
  if (scriptureLines.length) content.push('', ...scriptureLines);
  if (detail.description?.trim()) content.push('', detail.description.trim());

  return {
    id: detail.id,
    writerId: detail.writerId,
    tab: 'WORD',
    author: {
      handle: fallback.author.handle,
      name: detail.writerName,
      nickname: detail.writerNickname ?? '',
      initial: detail.writerName?.[0] ?? fallback.author.initial,
      hasAvatar: Boolean(fallback.author.imageUri),
      imageUri: fallback.author.imageUri,
    },
    timeAgo: getTimeAgo(detail.createdAt),
    content,
    likeCount: detail.likeCount,
    commentCount: detail.commentCount ?? 0,
    isLiked: detail.isLiked,
    isMine: detail.isMine,
  };
}

function getNoteEndpoint(tab: FaithNoteTab, noteId: string) {
  if (tab === 'THANKS') return `/notes/thanks/${noteId}`;
  if (tab === 'PRAYER') return `/notes/prayers/${noteId}`;
  return `/bible/notes/${noteId}`;
}

function getCommentEndpoint(tab: FaithNoteTab, noteId: string) {
  if (tab === 'THANKS') return `/notes/thanks/${noteId}/comments`;
  if (tab === 'PRAYER') return `/notes/prayers/${noteId}/comments`;
  return `/bible/notes/${noteId}/comments`;
}

function getLikeEndpoint(tab: FaithNoteTab, noteId: string) {
  if (tab === 'THANKS') return `/notes/thanks/${noteId}/like`;
  if (tab === 'WORD') return `/bible/notes/${noteId}/like`;
  return null;
}

function getReactionEndpoint(noteId: string) {
  return `/notes/prayers/${noteId}/reactions`;
}

function CommentRow({ item, onMenuPress }: { item: CommentItem; onMenuPress?: (item: CommentItem) => void }) {
  const primaryAuthor = item.author.nickname || item.author.name;
  const secondaryAuthor =
    item.author.handle && item.author.name !== primaryAuthor ? item.author.name : '';

  return (
    <View style={styles.commentRow}>
      {item.author.imageUri ? (
        <Image source={{ uri: item.author.imageUri }} style={styles.commentAvatar} />
      ) : (
        <View style={[styles.commentAvatar, styles.avatarFallback]}>
          <Text style={styles.commentAvatarText}>{item.author.initial}</Text>
        </View>
      )}

      <View style={styles.commentBody}>
        <View style={styles.commentAuthorColumn}>
          <View style={styles.authorTitleRow}>
            <Text style={styles.authorHandle}>{primaryAuthor}</Text>
            <Text style={styles.authorTime}>{item.timeAgo}</Text>
          </View>
          {secondaryAuthor ? <Text style={styles.authorName}>{secondaryAuthor}</Text> : null}
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>

      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => onMenuPress?.(item)}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

export default function FaithNoteDetailScreen() {
  const kb = useKeyboardHeight();
  const params = useLocalSearchParams<NoteDetailParams>();
  const fallback = useMemo(() => buildFallbackNote(toStringValue(params.id)), [params.id]);
  const noteId = toStringValue(params.id) ?? fallback.id;
  const tab = (toStringValue(params.tab) as FaithNoteTab) ?? fallback.tab;
  const initialContent = parseContentParam(params.content);

  const [note, setNote] = useState<FaithNoteItem>({
    id: noteId,
    tab,
    author: {
      handle: toStringValue(params.handle) ?? fallback.author.handle,
      name: toStringValue(params.name) ?? fallback.author.name,
      nickname: toStringValue(params.nickname) ?? fallback.author.nickname,
      initial: toStringValue(params.initial) ?? fallback.author.initial,
      hasAvatar: Boolean(toStringValue(params.imageUri)),
      imageUri: toStringValue(params.imageUri) || fallback.author.imageUri,
    },
    timeAgo: toStringValue(params.timeAgo) ?? fallback.timeAgo,
    content: initialContent.length > 0 ? initialContent : fallback.content,
    likeCount: toIntValue(params.likeCount, fallback.likeCount),
    commentCount: toIntValue(params.commentCount, fallback.commentCount),
    isLiked: toStringValue(params.isLiked) === '1',
  });
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const hasText = commentText.trim().length > 0;
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 댓글 ⋯ 메뉴 / 삭제 확인 / 수정 대상
  const [menuComment, setMenuComment] = useState<CommentItem | null>(null);
  const [pendingDeleteComment, setPendingDeleteComment] = useState<CommentItem | null>(null);
  const [editingComment, setEditingComment] = useState<CommentItem | null>(null);
  // 신고 대상 댓글 / 내가 차단한 사용자 (차단 사용자의 댓글은 클라이언트에서 숨김)
  const [reportComment, setReportComment] = useState<CommentItem | null>(null);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getBlockedUsers()
      .then((list) => setBlockedIds(new Set(list.map((u) => u.userId))))
      .catch(() => {});
  }, []);

  const handleReportComment = async (reason: string) => {
    const target = reportComment;
    setReportComment(null);
    if (!target) return;
    try {
      await reportContent('NOTE_COMMENT', target.id, reason);
      Alert.alert('신고 접수', '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    } catch (e: any) {
      Alert.alert('신고 실패', e?.message ?? '신고에 실패했습니다.');
    }
  };

  const handleBlockComment = (target: CommentItem) => {
    Alert.alert(
      '사용자 차단',
      `${target.author.nickname || target.author.name}님을 차단할까요?\n차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(target.userId);
              setBlockedIds((prev) => new Set(prev).add(target.userId));
            } catch (e: any) {
              Alert.alert('차단 실패', e?.message ?? '차단에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 노트 글 자체 신고/차단 (남의 노트 열람 시)
  const [reportNoteOpen, setReportNoteOpen] = useState(false);

  const handleReportNote = async (reason: string) => {
    setReportNoteOpen(false);
    try {
      await reportContent('NOTE', noteId, reason);
      Alert.alert('신고 접수', '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    } catch (e: any) {
      Alert.alert('신고 실패', e?.message ?? '신고에 실패했습니다.');
    }
  };

  const handleBlockNote = () => {
    if (!note.writerId) return;
    Alert.alert(
      '사용자 차단',
      `${note.author.nickname || note.author.name}님을 차단할까요?\n차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(note.writerId!);
              router.back();
            } catch (e: any) {
              Alert.alert('차단 실패', e?.message ?? '차단에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // ⋯ → 수정: 작성 화면을 편집 모드(noteId)로 진입
  const handleEdit = () => {
    const route =
      tab === 'THANKS' ? '/faith-note/write-thanks'
      : tab === 'PRAYER' ? '/faith-note/write-prayer'
      : '/faith-note/write-word';
    router.push({ pathname: route, params: { noteId } });
  };

  // ⋯ → 삭제: 확인 후 삭제 → 목록으로 복귀
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await apiClient(getNoteEndpoint(tab, noteId), { method: 'DELETE' });
      router.back();
    } catch {
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  };

  // 댓글 ⋯ → 삭제 확인 → 삭제 (본인 댓글만)
  const handleDeleteCommentConfirm = async () => {
    const target = pendingDeleteComment;
    setPendingDeleteComment(null);
    if (!target) return;
    try {
      await apiClient(`${getCommentEndpoint(tab, noteId)}/${target.id}`, { method: 'DELETE' });
      setComments((cur) => cur.filter((c) => c.id !== target.id));
      setNote((n) => ({ ...n, commentCount: Math.max(n.commentCount - 1, 0) }));
    } catch {
      Alert.alert('오류', '댓글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const endpoint = getNoteEndpoint(tab, noteId);
        if (tab === 'THANKS') {
          const detail = await apiClient<ThanksDetailResponse>(endpoint);
          if (!cancelled) setNote((prev) => toThanksNote(detail, prev));
        } else if (tab === 'PRAYER') {
          const detail = await apiClient<PrayerDetailResponse>(endpoint);
          if (!cancelled) setNote((prev) => toPrayerNote(detail, prev));
        } else {
          const detail = await apiClient<WordDetailResponse>(endpoint);
          if (!cancelled) setNote((prev) => toWordNote(detail, prev));
        }
      } catch (error) {
        console.warn('[faith-note-detail] detail fetch 실패', error);
      }
    };

    const fetchComments = async () => {
      try {
        const result = await apiClient<ApiCommentListResponse>(getCommentEndpoint(tab, noteId));
        if (!cancelled) {
          setComments((result.comments ?? []).map(toCommentItem));
          setNote((prev) => ({ ...prev, commentCount: result.totalCount ?? 0 }));
        }
      } catch (error) {
        console.warn('[faith-note-detail] comments fetch 실패', error);
      }
    };

    fetchDetail();
    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [noteId, tab]);

  const handleLikeToggle = async () => {
    const endpoint = getLikeEndpoint(tab, noteId);
    if (!endpoint) return;

    const prev = note;
    setNote((current) => ({
      ...current,
      isLiked: !current.isLiked,
      likeCount: current.isLiked ? Math.max(current.likeCount - 1, 0) : current.likeCount + 1,
    }));

    try {
      const result = await apiClient<{ likeCount: number; isLiked: boolean }>(endpoint, { method: 'PATCH' });
      setNote((current) => ({
        ...current,
        likeCount: result.likeCount,
        isLiked: result.isLiked,
      }));
    } catch (error) {
      setNote(prev);
      console.warn('[faith-note-detail] like toggle 실패', error);
    }
  };

  const handleReactionToggle = async (_id: string, emoji: string) => {
    if (tab !== 'PRAYER') return;

    const prev = note;
    setNote((current) => ({
      ...current,
      reactions: normalizePrayerReactions(current.reactions).map((reaction) =>
        reaction.emoji === emoji
          ? {
              ...reaction,
              reacted: !reaction.reacted,
              count: reaction.reacted ? Math.max(reaction.count - 1, 0) : reaction.count + 1,
            }
          : reaction,
      ),
    }));

    try {
      const reactions = await apiClient<{ emoji: string; count: number; reacted: boolean }[]>(
        getReactionEndpoint(noteId),
        {
          method: 'PATCH',
          body: JSON.stringify({ emoji }),
        },
      );
      setNote((current) => ({ ...current, reactions: normalizePrayerReactions(reactions) }));
    } catch (error) {
      setNote(prev);
      console.warn('[faith-note-detail] reaction toggle 실패', error);
    }
  };

  // 댓글 ⋯ → 수정: 입력창을 편집 모드로 전환
  const handleEditComment = (comment: CommentItem) => {
    setEditingComment(comment);
    setCommentText(comment.text);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setCommentText('');
    inputRef.current?.blur();
  };

  const handleSubmit = async () => {
    if (!hasText) return;
    const content = commentText.trim();

    // 편집 모드 → 기존 댓글 수정(PATCH)
    if (editingComment) {
      const target = editingComment;
      try {
        const updated = await apiClient<ApiCommentItem>(
          `${getCommentEndpoint(tab, noteId)}/${target.id}`,
          { method: 'PATCH', body: JSON.stringify({ content }) },
        );
        setComments((prev) => prev.map((c) => (c.id === target.id ? toCommentItem(updated) : c)));
        setEditingComment(null);
        setCommentText('');
        inputRef.current?.blur();
      } catch (error) {
        Alert.alert('오류', '댓글 수정에 실패했습니다.');
        console.warn('[faith-note-detail] update comment 실패', error);
      }
      return;
    }

    try {
      const created = await apiClient<ApiCommentItem>(getCommentEndpoint(tab, noteId), {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      setComments((prev) => [...prev, toCommentItem(created)]);
      setNote((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      setCommentText('');
      inputRef.current?.blur();
    } catch (error) {
      console.warn('[faith-note-detail] create comment 실패', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" backgroundColor={colors.background.base} />
      <FaithNoteHeader />

      {/* 키보드가 올라오면 스크롤+입력바 전체를 키보드 높이만큼 올림 → 입력바가 키보드 바로 위에 붙음.
          KeyboardAvoidingView는 키보드 내린 뒤 잔여 padding이 남아 입력바 아래 여백이 생겨 직접 처리. */}
      <View style={[styles.flex, { marginBottom: kb }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FaithNoteCard
            item={note}
            onLikeToggle={handleLikeToggle}
            onReactionToggle={handleReactionToggle}
            onCommentPress={() => inputRef.current?.focus()}
            onEdit={handleEdit}
            onDelete={() => setShowDeleteConfirm(true)}
            onReport={() => setReportNoteOpen(true)}
            onBlock={handleBlockNote}
            isDetailScreen
            variant="detail"
          />

          {comments.filter((c) => !blockedIds.has(c.userId)).length > 0 ? (
            <View style={styles.commentList}>
              {comments
                .filter((c) => !blockedIds.has(c.userId))
                .map((item) => (
                  <CommentRow key={item.id} item={item} onMenuPress={setMenuComment} />
                ))}
            </View>
          ) : (
            <View style={styles.commentEmptySpace} />
          )}
        </ScrollView>

        {editingComment ? (
          <View style={styles.editBanner}>
            <Text style={styles.editBannerText}>댓글 수정 중</Text>
            <TouchableOpacity onPress={handleCancelEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.editCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="댓글을 입력해주세요"
            placeholderTextColor={colors.text.secondary}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={hasText ? 0.7 : 1}
          >
            <Text style={styles.submitText}>{editingComment ? '수정' : '등록'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 삭제 확인 팝업 ── */}
      <Popup
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="노트를 삭제하시겠어요?"
        description="삭제한 노트는 복구할 수 없어요."
        buttons={[
          { label: '취소', onPress: () => setShowDeleteConfirm(false), variant: 'secondary' },
          { label: '삭제', onPress: handleDeleteConfirm, variant: 'primary' },
        ]}
      />

      {/* ── 댓글 ⋯ 메뉴 — 본인: 수정/삭제, 타인: 신고/차단 ── */}
      <BottomSheet visible={!!menuComment} onClose={() => setMenuComment(null)} disableContentPadding>
        {menuComment?.isMine ? (
          <>
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                const target = menuComment;
                setMenuComment(null);
                if (target) handleEditComment(target);
              }}
            >
              <Text style={styles.menuText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                const target = menuComment;
                setMenuComment(null);
                setPendingDeleteComment(target);
              }}
            >
              <Text style={[styles.menuText, styles.menuTextDanger]}>삭제하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                const target = menuComment;
                setMenuComment(null);
                setReportComment(target);
              }}
            >
              <Text style={[styles.menuText, styles.menuTextDanger]}>신고하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                const target = menuComment;
                setMenuComment(null);
                if (target) handleBlockComment(target);
              }}
            >
              <Text style={[styles.menuText, styles.menuTextDanger]}>사용자 차단</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheet>

      {/* ── 댓글 신고 사유 선택 ── */}
      <ReportReasonSheet
        visible={!!reportComment}
        onClose={() => setReportComment(null)}
        onSelect={handleReportComment}
      />

      {/* ── 노트 글 신고 사유 선택 ── */}
      <ReportReasonSheet
        visible={reportNoteOpen}
        onClose={() => setReportNoteOpen(false)}
        onSelect={handleReportNote}
      />

      {/* ── 댓글 삭제 확인 팝업 ── */}
      <Popup
        visible={!!pendingDeleteComment}
        onClose={() => setPendingDeleteComment(null)}
        title="댓글을 삭제하시겠어요?"
        description="삭제한 댓글은 복구할 수 없어요."
        buttons={[
          { label: '취소', onPress: () => setPendingDeleteComment(null), variant: 'secondary' },
          { label: '삭제', onPress: handleDeleteCommentConfirm, variant: 'primary' },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
  },
  commentList: {
    backgroundColor: colors.white,
  },
  commentEmptySpace: {
    flex: 1,
    minHeight: 240,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',   // 아바타·⋯ 메뉴를 댓글 본문 기준 세로 중앙 정렬
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.base,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  commentBody: {
    flex: 1,
    gap: spacing.xs,
  },
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
  commentAuthorColumn: {
    flex: 1,
    minWidth: 0,
  },
  commentText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 21,
  },
  avatarFallback: {
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  authorHandle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flexShrink: 1,
  },
  authorTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  editBannerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  editCancelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.accent,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(13,28,45,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: 0,             // 고정 높이 단일라인 — 세로 패딩 제거(텍스트 잘림 방지)
    textAlignVertical: 'center',    // Android 세로 중앙 정렬
    includeFontPadding: false,      // Android 폰트 상하 여백 제거(플레이스홀더 흔들림/잘림 방지)
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  submitButton: {
    minWidth: 45,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
