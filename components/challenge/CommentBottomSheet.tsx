import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import type { CommentItem } from '@/hooks/useChallenge';
import { useCertificationComments } from '@/hooks/useChallenge';
import { blockUser, reportContent } from '@/utils/moderation';
import { ReportReasonSheet } from '@/components/shared/ReportReasonSheet';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AVATAR_SIZE = 32;

function CommentAvatar({ uri, name }: { uri?: string | null; name: string }) {
  if (uri) return <Image source={{ uri }} style={styles.avatar} />;
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
    </View>
  );
}

function formatTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function CommentRow({
  comment,
  onDelete,
  onMenu,
}: {
  comment: CommentItem;
  onDelete: (id: string) => void;
  onMenu: (comment: CommentItem) => void;
}) {
  return (
    <View style={styles.commentRow}>
      <CommentAvatar uri={comment.writerProfileImage} name={comment.writerName} />
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentName}>{comment.writerName}</Text>
          <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
      </View>
      {comment.isMine ? (
        <TouchableOpacity
          onPress={() => onDelete(comment.commentId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => onMenu(comment)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface Props {
  visible: boolean;
  certificationId: string;
  commentCount: number;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

export function CommentBottomSheet({
  visible,
  certificationId,
  commentCount,
  onClose,
  onCommentCountChange,
}: Props) {
  const { comments, isLoading, fetch, createComment, deleteComment } = useCertificationComments(certificationId);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<CommentItem | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const hasFetched = useRef(false);
  const { bottom: bottomInset } = useSafeAreaInsets();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    if (visible && !hasFetched.current) {
      fetch();
      hasFetched.current = true;
    }
    if (!visible) hasFetched.current = false;
  }, [visible, fetch]);

  useEffect(() => {
    onCommentCountChange?.(comments.length);
  }, [comments.length, onCommentCountChange]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setText('');
    await createComment(trimmed);
    setIsSending(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleMenu = (comment: CommentItem) => {
    Alert.alert(comment.writerName, undefined, [
      { text: '신고하기', style: 'destructive', onPress: () => setReportTarget(comment) },
      {
        text: '사용자 차단',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            '사용자 차단',
            `${comment.writerName}님을 차단할까요?\n차단하면 이 사용자의 인증글과 댓글이 더 이상 보이지 않습니다.`,
            [
              { text: '취소', style: 'cancel' },
              {
                text: '차단',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await blockUser(comment.userId);
                    fetch();
                  } catch (err) {
                    Alert.alert('차단 실패', (err as Error)?.message || '차단에 실패했습니다.');
                  }
                },
              },
            ],
          ),
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleReport = async (reason: string) => {
    if (!reportTarget) return;
    try {
      await reportContent('CERTIFICATION_COMMENT', reportTarget.commentId, reason);
      Alert.alert('신고 접수', '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    } catch (err) {
      Alert.alert('신고 실패', (err as Error)?.message || '신고에 실패했습니다.');
    } finally {
      setReportTarget(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.kav}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { marginBottom: keyboardHeight }]}>
          {/* 핸들 */}
          <View style={styles.handle} />

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>댓글 {comments.length > 0 ? comments.length : commentCount}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* 댓글 목록 */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>첫 댓글을 남겨보세요</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {comments.map(c => (
                <CommentRow key={c.commentId} comment={c} onDelete={handleDelete} onMenu={handleMenu} />
              ))}
            </ScrollView>
          )}

          {/* 입력창 */}
          <View style={[styles.inputRow, { paddingBottom: keyboardHeight > 0 ? spacing.sm : bottomInset + spacing.sm }]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="댓글 달기..."
              placeholderTextColor={colors.text.secondary}
              value={text}
              onChangeText={setText}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || isSending}
              style={[styles.sendBtn, (!text.trim() || isSending) && styles.sendBtnDisabled]}
            >
              <Ionicons name="send" size={18} color={text.trim() ? colors.primary : colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ReportReasonSheet
        visible={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSelect={handleReport}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.default,
  },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
  },
  handle: {
    width: spacing.xxl + spacing.sm,
    height: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.smmd,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  loadingBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 0,
    maxHeight: 360,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  emptyBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  commentTime: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  commentContent: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    lineHeight: fontSize.sm * 1.5,
  },
  deleteBtn: {
    paddingLeft: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.base,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.smmd,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendBtn: {
    paddingBottom: spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
