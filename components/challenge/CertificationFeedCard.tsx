import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import type { MyCertificationItem, OtherCertificationItem } from '@/hooks/useChallenge';
import { useCertificationLike } from '@/hooks/useChallenge';
import { apiClient } from '@/utils/apiClient';
import { blockUser, reportContent } from '@/utils/moderation';
import { ReportReasonSheet } from '@/components/shared/ReportReasonSheet';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { CommentBottomSheet } from './CommentBottomSheet';

const HEART_PATH =
  'M7.49063 3.97512C8.28683 3.83946 9.10332 3.88421 9.87992 4.10608C10.6565 4.32794 11.3734 4.72126 11.9778 5.25705L12.0111 5.28673L12.0417 5.25975C12.6185 4.75354 13.2966 4.37616 14.0309 4.15278C14.7651 3.92939 15.5385 3.86515 16.2995 3.96433L16.5208 3.99671C17.48 4.16234 18.3766 4.58429 19.1156 5.21789C19.8546 5.85149 20.4086 6.67314 20.7187 7.59585C21.0289 8.51856 21.0837 9.50796 20.8774 10.4593C20.6712 11.4106 20.2115 12.2885 19.547 12.9999L19.3851 13.1663L19.3419 13.2032L12.6399 19.8413C12.4853 19.9944 12.2804 20.0862 12.0632 20.0998C11.846 20.1133 11.6313 20.0477 11.4587 19.9151L11.3742 19.8413L4.63351 13.1645C3.91943 12.4697 3.41159 11.5908 3.16623 10.6252C2.92087 9.65954 2.94757 8.64484 3.24338 7.69344C3.53918 6.74204 4.09254 5.89108 4.84218 5.2348C5.59182 4.57852 6.50847 4.14253 7.49063 3.97512Z';

const BUBBLE_PATH =
  'M3.50001 12C3.50001 7.30568 7.30569 3.5 12 3.5C16.6943 3.5 20.5 7.30568 20.5 12C20.5 16.6943 16.6943 20.5 12 20.5H3.73182L5.44728 17.4137C4.18635 15.8917 3.49748 13.9765 3.50001 12Z';

const heartXml = (fill: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${HEART_PATH}" fill="${fill}"/></svg>`;

const bubbleXml =
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${BUBBLE_PATH}" fill="rgba(13,28,45,0.3)"/></svg>`;

const AVATAR_SIZE = 32;
const PHOTO_HEIGHT = 220;

function formatRelativeDate(dateStr: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000,
  );
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

function ProfileAvatar({ uri, name, isMe }: { uri?: string | null; name: string; isMe?: boolean }) {
  if (isMe) {
    return (
      <View style={[styles.avatar, styles.avatarMe]}>
        <Ionicons name="person" size={spacing.md} color={colors.white} />
      </View>
    );
  }
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
    </View>
  );
}

type MenuOption = { label: string; onPress: () => void; destructive?: boolean };

function MeatballMenu({ options }: { options: MenuOption[] }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
        style={styles.meatballBtn}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sheetOption, i === options.length - 1 && styles.sheetOptionLast]}
                onPress={() => { setVisible(false); opt.onPress(); }}
              >
                <Text style={[styles.sheetOptionText, opt.destructive && styles.sheetOptionDestructive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function ReactionRow({
  certificationId,
  initialLiked,
  initialLikeCount,
  initialCommentCount,
}: {
  certificationId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialCommentCount: number;
}) {
  const { liked, likeCount, toggle } = useCertificationLike(certificationId, initialLiked, initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setCommentCount(initialCommentCount);
  }, [initialCommentCount]);

  return (
    <>
      <View style={styles.reactionRow}>
        <TouchableOpacity style={styles.reactionChip} onPress={toggle} activeOpacity={0.7}>
          <SvgXml xml={heartXml(liked ? colors.reaction.red : 'rgba(13,28,45,0.3)')} width={16} height={16} />
          {likeCount > 0 ? <Text style={styles.reactionCount}>{likeCount}</Text> : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionChip} onPress={() => setShowComments(true)} activeOpacity={0.7}>
          <SvgXml xml={bubbleXml} width={16} height={16} />
          {commentCount > 0 ? <Text style={styles.reactionCount}>{commentCount}</Text> : null}
        </TouchableOpacity>
      </View>
      <CommentBottomSheet
        visible={showComments}
        certificationId={certificationId}
        commentCount={commentCount}
        onClose={() => setShowComments(false)}
        onCommentCountChange={setCommentCount}
      />
    </>
  );
}

type MyCertificationCardProps = {
  item: MyCertificationItem;
  onDelete?: () => void;
  onEditDone?: () => void;
};

export function MyCertificationCard({ item, onDelete, onEditDone }: MyCertificationCardProps) {
  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState(item.meditationText ?? '');
  const [editPrivate, setEditPrivate] = useState(item.isPrivate);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '인증 삭제',
      '삭제하면 좋아요, 댓글도 함께 삭제됩니다. 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient(`/challenges/certifications/${item.certId}`, { method: 'DELETE' });
              onDelete?.();
            } catch (err) {
              Alert.alert('삭제 실패', (err as Error)?.message || '삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  const handleEditOpen = () => {
    setEditText(item.meditationText ?? '');
    setEditPrivate(item.isPrivate);
    setEditVisible(true);
  };

  const handleEditSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiClient(`/challenges/certifications/${item.certId}`, {
        method: 'PATCH',
        body: JSON.stringify({ meditationText: editText.trim() || null, isPrivate: editPrivate }),
      });
      setEditVisible(false);
      onEditDone?.();
    } catch (err) {
      Alert.alert('수정 실패', (err as Error)?.message || '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.rowItem}>
          <ProfileAvatar isMe name="나" />
          <View style={styles.metaCol}>
            <View style={styles.nicknameRow}>
              <Text style={styles.nickname}>나</Text>
              <Text style={styles.time}>{formatRelativeDate(item.date)}</Text>
            </View>
          </View>
          <MeatballMenu
            options={[
              { label: '인증 수정', onPress: handleEditOpen },
              { label: '인증 삭제', onPress: handleDelete, destructive: true },
            ]}
          />
        </View>

        {item.meditationText ? (
          <View style={styles.bodySection}>
            {item.isPrivate ? (
              <Ionicons name="lock-closed-outline" size={14} color={colors.text.secondary} />
            ) : null}
            <Text style={styles.bodyText}>{item.meditationText}</Text>
          </View>
        ) : null}

        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.photo} resizeMode="cover" />
        ) : null}

        <ReactionRow
          certificationId={item.certId}
          initialLiked={item.isLikedByMe ?? false}
          initialLikeCount={item.likeCount ?? 0}
          initialCommentCount={item.commentCount ?? 0}
        />
      </View>

      {/* 수정 모달 */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={editStyles.overlay}>
          <View style={editStyles.card}>
            <Text style={editStyles.title}>인증 수정</Text>

            <TextInput
              style={editStyles.input}
              placeholder="내용을 입력해주세요"
              placeholderTextColor={colors.text.secondary}
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={editStyles.privateRow}
              onPress={() => setEditPrivate(p => !p)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={editPrivate ? 'lock-closed' : 'lock-open'}
                size={16}
                color={editPrivate ? colors.primary : colors.text.secondary}
              />
              <Text style={[editStyles.privateText, editPrivate && { color: colors.primary }]}>
                나만 보기
              </Text>
            </TouchableOpacity>

            <View style={editStyles.btnRow}>
              <TouchableOpacity
                style={[editStyles.btn, editStyles.btnCancel]}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={editStyles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[editStyles.btn, editStyles.btnSave]}
                onPress={handleEditSave}
                activeOpacity={0.8}
                disabled={submitting}
              >
                <Text style={editStyles.btnTextSave}>{submitting ? '저장 중...' : '저장'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function OtherCertificationCard({ item, onChanged }: { item: OtherCertificationItem; onChanged?: () => void }) {
  const [reportVisible, setReportVisible] = useState(false);

  const handleReport = async (reason: string) => {
    try {
      await reportContent('CERTIFICATION', item.certId, reason);
      Alert.alert('신고 접수', '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    } catch (err) {
      Alert.alert('신고 실패', (err as Error)?.message || '신고에 실패했습니다.');
    }
  };

  const handleBlock = () => {
    if (!item.writerId) return;
    Alert.alert(
      '사용자 차단',
      `${item.writerName}님을 차단할까요?\n차단하면 이 사용자의 인증글과 댓글이 더 이상 보이지 않습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(item.writerId!);
              onChanged?.();
            } catch (err) {
              Alert.alert('차단 실패', (err as Error)?.message || '차단에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowItem}>
        <ProfileAvatar uri={item.writerProfileImage} name={item.writerName} />
        <View style={styles.metaCol}>
          <View style={styles.nicknameRow}>
            <Text style={styles.nickname}>{item.writerName}</Text>
            <Text style={styles.time}>{formatRelativeDate(item.date)}</Text>
          </View>
        </View>
        <MeatballMenu
          options={[
            { label: '신고하기', onPress: () => setReportVisible(true), destructive: true },
            ...(item.writerId ? [{ label: '사용자 차단', onPress: handleBlock, destructive: true }] : []),
          ]}
        />
      </View>

      <ReportReasonSheet
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onSelect={handleReport}
      />

      {item.meditationText ? (
        <View style={styles.bodySection}>
          <Text style={styles.bodyText}>{item.meditationText}</Text>
        </View>
      ) : null}

      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : null}

      <ReactionRow
        certificationId={item.certId}
        initialLiked={item.isLikedByMe ?? false}
        initialLikeCount={item.likeCount ?? 0}
        initialCommentCount={item.commentCount ?? 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingBottom: spacing.nano,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarMe: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nickname: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  time: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },

  meatballBtn: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },

  bodySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  bodyText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: fontSize.md * 1.5,
  },

  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
  },

  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.smmd,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.nano,
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    height: 28,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
  },
  reactionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: spacing.xxl + spacing.sm,
    height: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.smmd,
    marginBottom: spacing.md,
  },
  sheetOption: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionLast: {
    borderBottomWidth: 0,
  },
  sheetOptionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  sheetOptionDestructive: {
    color: colors.reaction.red,
  },
});

const editStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background.base,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
    marginBottom: spacing.sm,
  },
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    paddingVertical: spacing.xs,
  },
  privateText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: { backgroundColor: colors.border },
  btnSave: { backgroundColor: colors.primary },
  btnTextCancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  btnTextSave: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
