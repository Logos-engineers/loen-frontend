import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import AlarmSection from '@/components/challenge/AlarmSection';
import {
  ChallengeAlarm,
  deleteAlarmsById,
} from '@/components/challenge/challengeTypes';
import { BIBLE_BOOKS as BIBLE_BOOK_META } from '@/constants/BibleMeta';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChallengeVisibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [visibility, setVisibility] = useState<'public' | 'oikos' | 'link'>('public');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // 알람 (AlarmSection controlled state)
  const [alarms, setAlarms] = useState<ChallengeAlarm[]>([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  // 토스트
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCancelManage = () => {
    setIsManageMode(false);
    setSelectedForDelete([]);
  };

  const handleDeleteAlarms = async () => {
    if (selectedForDelete.length === 0) return;
    const count = selectedForDelete.length;
    const newAlarms = await deleteAlarmsById(alarms, selectedForDelete);
    setAlarms(newAlarms);
    setSelectedForDelete([]);
    setIsManageMode(false);
    showToast(`${count}개의 알람을 삭제했어요`);
  };

  const handleBack = () => {
    if (isManageMode) handleCancelManage();
    else setIsExitModalOpen(true);
  };

  const handleComplete = async () => {
    const selectedBooks: string[] = params.selectedBooks ? JSON.parse(params.selectedBooks as string) : [];
    const totalChapters = Number(params.totalChapters || 0);

    const toIsoDate = (iso: string) => new Date(iso).toISOString().split('T')[0];

    try {
      const bookCodes = selectedBooks.map(
        name => BIBLE_BOOK_META.find(b => b.korName === name)?.code ?? name
      );
      const notifTimes = alarms.filter(a => a.enabled).map(
        a => `${String(a.hour).padStart(2, '0')}:${String(a.minute).padStart(2, '0')}`
      );
      const visibilityMap = { public: 'PUBLIC', oikos: 'OIKOS', link: 'LINK' } as const;

      await apiClient('/challenges/bible', {
        method: 'POST',
        body: JSON.stringify({
          name: params.challengeName as string,
          bibleBooks: bookCodes,
          targetType: 'PERIOD',
          targetValue: totalChapters,
          startDate: params.startDate ? toIsoDate(params.startDate as string) : '',
          endDate: params.endDate ? toIsoDate(params.endDate as string) : '',
          visibility: visibilityMap[visibility],
          notificationEnabled: alarms.some(a => a.enabled),
          notificationTimes: notifTimes,
        }),
      });
    } catch {
      // API 저장 실패 무시
    }

    router.push('/challenge/complete');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isManageMode ? '삭제할 알람 선택' : '성경 챌린지 만들기'}
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 공개 범위 */}
        <View pointerEvents={isManageMode ? 'none' : 'auto'} style={{ opacity: isManageMode ? 0.3 : 1 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>챌린지 공개</Text>
          </View>

          {(['public', 'oikos', 'link'] as const).map(v => {
            const info = {
              public: { icon: 'people' as const,  title: '전체 공개',    desc: '로고스 청년 모두에게 공개되며,\n모두가 챌린지에 참여할 수 있어요' },
              oikos:  { icon: 'person' as const,  title: '오이코스 공개', desc: '오이코스원에게만 공개되며, 오이코스원만 \n챌린지에 참여할 수 있어요. 챌린지 생성 완료 후 \n링크로도 공유 가능해요.' },
              link:   { icon: 'link' as const,    title: '링크로 공개',  desc: '챌린지 생성 완료 후 공유한 링크를 전달 받은 \n청년만 챌린지에 참여할 수 있어요.' },
            }[v];
            const isLast = v === 'link';
            return (
              <TouchableOpacity
                key={v}
                style={[styles.optionCard, isLast && { marginBottom: spacing.xxl }]}
                activeOpacity={0.7}
                onPress={() => setVisibility(v)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={info.icon} size={28} color={colors.text.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{info.title}</Text>
                  <Text style={styles.optionDesc} numberOfLines={1}>{info.desc}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={visibility === v ? colors.primary : colors.text.dim} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 알람 설정 */}
        <AlarmSection
          alarms={alarms}
          onAlarmsChange={setAlarms}
          isManageMode={isManageMode}
          onManageModeChange={setIsManageMode}
          selectedForDelete={selectedForDelete}
          onSelectedForDeleteChange={setSelectedForDelete}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        {isManageMode ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={handleCancelManage} activeOpacity={0.7}>
              <Text style={styles.btnTextCancel}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, selectedForDelete.length > 0 ? styles.btnDelete : styles.btnCancel]}
              onPress={handleDeleteAlarms}
              activeOpacity={0.8}
              disabled={selectedForDelete.length === 0}
            >
              <Text style={[styles.btnTextActive, selectedForDelete.length === 0 && { color: colors.primary }]}>
                {selectedForDelete.length > 0 ? `${selectedForDelete.length}개 삭제하기` : '삭제하기'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.btnTextCancel}>이전으로</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnActive]} onPress={handleComplete} activeOpacity={0.8}>
              <Text style={styles.btnTextActive}>완료</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 토스트 */}
      {toastMessage && (
        <View style={[styles.toastContainer, { bottom: insets.bottom + 90 }]}>
          <View style={styles.toastContent}>
            <View style={styles.toastIconWrapper}>
              <Ionicons name="checkmark" size={16} color={colors.white} />
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 이탈 방지 모달 */}
      <Modal visible={isExitModalOpen} transparent animationType="fade" onRequestClose={() => setIsExitModalOpen(false)}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.exitModalCard}>
            <Text style={styles.exitModalText}>지금까지 입력한 내용이 저장되지 않아요</Text>
            <View style={styles.exitModalBtnRow}>
              <TouchableOpacity style={[styles.exitModalBtn, styles.exitModalBtnStay]} onPress={() => setIsExitModalOpen(false)} activeOpacity={0.8}>
                <Text style={styles.exitModalBtnTextStay}>머무르기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exitModalBtn, styles.exitModalBtnLeave]} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
                <Text style={styles.exitModalBtnTextLeave}>나가기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.background.base },
  backButton: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerRightSpace: { width: 32 },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.xl },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },

  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.elevated, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md,
  },
  optionIcon: { marginRight: spacing.smmd },
  optionTextContainer: { flex: 1, marginRight: spacing.sm },
  optionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 4 },
  optionDesc: { fontSize: fontSize.sm, color: colors.text.secondary },

  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 49, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.primaryLight },
  btnActive: { backgroundColor: colors.primary },
  btnDelete: { backgroundColor: '#FF5A5A' },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },

  toastContainer: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center', zIndex: 999 },
  toastContent: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(40,40,50,0.95)', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  toastIconWrapper: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  toastText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  modalOverlayCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  exitModalCard: { width: '80%', backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center' },
  exitModalText: { fontSize: fontSize.base, color: colors.text.primary, fontWeight: fontWeight.medium, marginBottom: spacing.xl, textAlign: 'center' },
  exitModalBtnRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  exitModalBtn: { flex: 1, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  exitModalBtnStay: { backgroundColor: '#F0F0F5' },
  exitModalBtnTextStay: { color: colors.text.primary, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  exitModalBtnLeave: { backgroundColor: '#FF5A5A' },
  exitModalBtnTextLeave: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
