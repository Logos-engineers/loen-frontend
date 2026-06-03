import { UserSearchModal } from '@/components/oikos/user-search-modal';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  positionLabel,
  useOikosManagement,
  type GroupNode,
  type OikosNode,
  type UserSearchItem,
} from '@/hooks/useOikosManagement';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SearchTarget = { oikosId: string; role: 'leader' | 'sleader' | 'member' };

const ROLE_TITLE: Record<SearchTarget['role'], string> = {
  leader: '리더 지정',
  sleader: 'S리더 지정',
  member: '부원 추가',
};

export default function OikosManagementScreen() {
  const { view, isLoading, error, createOikos, assignLeaders, addMember, removeMember } =
    useOikosManagement();

  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [newOikosName, setNewOikosName] = useState('');
  const [busy, setBusy] = useState(false);

  const canManageGroup = view?.canManageGroup ?? false;
  const canManageMembers = view?.canManageMembers ?? false;

  const handleSelectUser = async (user: UserSearchItem) => {
    if (!searchTarget) return;
    const { oikosId, role } = searchTarget;
    setSearchTarget(null);
    setBusy(true);
    try {
      if (role === 'member') {
        await addMember(oikosId, user.uid);
      } else if (role === 'leader') {
        await assignLeaders(oikosId, { leaderId: user.uid });
      } else {
        await assignLeaders(oikosId, { sleaderId: user.uid });
      }
    } catch (e: any) {
      Alert.alert('실패', e?.message ?? '처리하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateOikos = async () => {
    const name = newOikosName.trim();
    if (!name) return;
    setCreateVisible(false);
    setNewOikosName('');
    setBusy(true);
    try {
      await createOikos(name);
    } catch (e: any) {
      Alert.alert('실패', e?.message ?? '오이코스를 만들지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const confirmRemoveMember = (oikosId: string, member: { uid: string; name: string }) => {
    Alert.alert('부원 제외', `${member.name} 님을 오이코스에서 제외할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '제외',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removeMember(oikosId, member.uid);
          } catch (e: any) {
            Alert.alert('실패', e?.message ?? '제외하지 못했습니다.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오이코스 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !view ? null : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.roleBadge}>
            <Ionicons name="ribbon-outline" size={16} color={colors.primary} />
            <Text style={styles.roleBadgeText}>{positionLabel(view.position)}</Text>
          </View>

          {view.groups.length === 0 ? (
            <Text style={styles.emptyText}>표시할 오이코스가 없어요.</Text>
          ) : (
            view.groups.map((group) => (
              <GroupSection
                key={group.id}
                group={group}
                canManageGroup={canManageGroup}
                canManageMembers={canManageMembers}
                onAddOikos={() => setCreateVisible(true)}
                onAssign={(oikosId, role) => setSearchTarget({ oikosId, role })}
                onRemoveMember={confirmRemoveMember}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* 사용자 검색 (리더/S리더/부원 지정) */}
      <UserSearchModal
        visible={searchTarget !== null}
        title={searchTarget ? ROLE_TITLE[searchTarget.role] : ''}
        onClose={() => setSearchTarget(null)}
        onSelect={handleSelectUser}
      />

      {/* 오이코스 생성 (그룹장) */}
      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>새 오이코스</Text>
            <TextInput
              style={styles.dialogInput}
              placeholder="오이코스 이름"
              placeholderTextColor={colors.text.dim}
              value={newOikosName}
              onChangeText={setNewOikosName}
              autoFocus
              maxLength={30}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogBtn}
                onPress={() => {
                  setCreateVisible(false);
                  setNewOikosName('');
                }}
              >
                <Text style={styles.dialogBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnPrimary]}
                onPress={handleCreateOikos}
                disabled={!newOikosName.trim()}
              >
                <Text style={[styles.dialogBtnText, styles.dialogBtnTextPrimary]}>만들기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {busy ? (
        <View style={styles.busyOverlay} pointerEvents="auto">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ── 그룹 섹션 ──────────────────────────────────────────────────────────
function GroupSection({
  group,
  canManageGroup,
  canManageMembers,
  onAddOikos,
  onAssign,
  onRemoveMember,
}: {
  group: GroupNode;
  canManageGroup: boolean;
  canManageMembers: boolean;
  onAddOikos: () => void;
  onAssign: (oikosId: string, role: 'leader' | 'sleader') => void;
  onRemoveMember: (oikosId: string, member: { uid: string; name: string }) => void;
}) {
  return (
    <View style={styles.groupSection}>
      <View style={styles.groupHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.groupLeaderName ? (
            <Text style={styles.groupLeader}>그룹장 · {group.groupLeaderName}</Text>
          ) : null}
        </View>
        {canManageGroup ? (
          <TouchableOpacity style={styles.addOikosBtn} onPress={onAddOikos} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addOikosText}>오이코스</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {group.oikosList.length === 0 ? (
        <Text style={styles.noOikos}>아직 오이코스가 없어요.</Text>
      ) : (
        group.oikosList.map((oikos) => (
          <OikosCard
            key={oikos.id}
            oikos={oikos}
            canManageGroup={canManageGroup}
            canManageMembers={canManageMembers}
            onAssign={onAssign}
            onRemoveMember={onRemoveMember}
          />
        ))
      )}
    </View>
  );
}

// ── 오이코스 카드 ──────────────────────────────────────────────────────
function OikosCard({
  oikos,
  canManageGroup,
  canManageMembers,
  onAssign,
  onRemoveMember,
}: {
  oikos: OikosNode;
  canManageGroup: boolean;
  canManageMembers: boolean;
  onAssign: (oikosId: string, role: 'leader' | 'sleader') => void;
  onRemoveMember: (oikosId: string, member: { uid: string; name: string }) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.oikosName}>{oikos.name}</Text>

      {/* 리더 */}
      <LeaderRow
        label="리더"
        name={oikos.leaderName}
        editable={canManageGroup}
        onPress={() => onAssign(oikos.id, 'leader')}
      />
      {/* S리더 */}
      <LeaderRow
        label="S리더"
        name={oikos.sleaderName}
        editable={canManageGroup}
        onPress={() => onAssign(oikos.id, 'sleader')}
      />

      <View style={styles.cardDivider} />

      {/* 부원 */}
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>부원 {oikos.members.length}명</Text>
        {canManageMembers ? (
          <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={() => onAssign(oikos.id, 'member' as 'leader')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={14} color={colors.primary} />
            <Text style={styles.addMemberText}>추가</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {oikos.members.length === 0 ? (
        <Text style={styles.noMembers}>부원이 없어요.</Text>
      ) : (
        oikos.members.map((m) => (
          <View key={m.uid} style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Ionicons name="person" size={14} color={colors.text.secondary} />
            </View>
            <Text style={styles.memberName}>{m.name}</Text>
            {canManageMembers ? (
              <TouchableOpacity onPress={() => onRemoveMember(oikos.id, m)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.text.dim} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

function LeaderRow({
  label,
  name,
  editable,
  onPress,
}: {
  label: string;
  name: string | null;
  editable: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.leaderRow}>
      <Text style={styles.leaderLabel}>{label}</Text>
      <Text style={[styles.leaderName, !name && styles.leaderNameEmpty]}>{name ?? '미지정'}</Text>
      {editable ? (
        <TouchableOpacity style={styles.assignBtn} onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.assignBtnText}>{name ? '변경' : '지정'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  emptyText: { textAlign: 'center', color: colors.text.dim, marginTop: spacing.xxl },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
  },
  roleBadgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },

  groupSection: { gap: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center' },
  groupName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  groupLeader: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  addOikosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addOikosText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  noOikos: { fontSize: fontSize.sm, color: colors.text.dim, paddingVertical: spacing.sm },

  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  oikosName: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  cardDivider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },

  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  leaderLabel: { width: 48, fontSize: fontSize.sm, color: colors.text.secondary },
  leaderName: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  leaderNameEmpty: { color: colors.text.dim, fontWeight: fontWeight.medium },
  assignBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  assignBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },

  membersHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  membersTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addMemberText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  noMembers: { fontSize: fontSize.sm, color: colors.text.dim, paddingVertical: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: { flex: 1, fontSize: fontSize.base, color: colors.text.primary },

  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialog: { backgroundColor: colors.background.base, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  dialogTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  dialogInput: {
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  dialogActions: { flexDirection: 'row', gap: spacing.sm },
  dialogBtn: { flex: 1, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.elevated },
  dialogBtnPrimary: { backgroundColor: colors.primary },
  dialogBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  dialogBtnTextPrimary: { color: '#fff' },

  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
