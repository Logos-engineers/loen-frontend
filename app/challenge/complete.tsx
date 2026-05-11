import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type CompleteCardProps = {
  title: string;
  value: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  rightComponent?: React.ReactNode;
};

const CompleteCard = ({ title, value, iconName, iconBgColor, rightComponent }: CompleteCardProps) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
      <Ionicons name={iconName} size={24} color={colors.white} />
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
    {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
  </View>
);

type BibleChallengeData = {
  challengeName: string;
  selectedBooks: string[];
  totalChapters: number;
  startDate: string;
  endDate: string;
  alarms: any[];
  visibility: 'public' | 'oikos' | 'link';
};

export default function ChallengeCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [challengeData, setChallengeData] = useState<BibleChallengeData | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('LOEN_BIBLE_CHALLENGE_CREATED_v1').then(data => {
        if (data) {
          setChallengeData(JSON.parse(data));
        }
      });
    }, [])
  );

  const handleEdit = () => {
    router.push('/challenge/edit');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleCopyLink = () => {
    // TODO: expo-clipboard 라이브러리 연동
    console.log('링크가 복사되었습니다!');
  };

  if (!challengeData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>저장된 성경 챌린지가 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { challengeName, selectedBooks, totalChapters, startDate, endDate, alarms, visibility } = challengeData;

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  const formatBooks = (books: string[]) => {
    if (!books || books.length === 0) return '';
    if (books.length === 1) return books[0];
    if (books.length === 2) return `${books[0]}, ${books[1]}`;
    return `${books[0]}, ${books[1]} 외 ${books.length - 2}권`;
  };

  const booksText = `${formatBooks(selectedBooks)} · 총 ${totalChapters}장`;
  const durationText = `${formatDate(startDate)}~${formatDate(endDate)}`;
  const alarmText = alarms.length > 0 ? `${alarms.length}개의 알람이 설정됐어요` : '설정된 알람이 없어요';
  const visibilityText = visibility === 'public' ? '전체 공개' : visibility === 'oikos' ? '오이코스 공개' : '링크로 공개';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSpace} />
        {/* 타이틀 없이 빈 헤더 (디자인 요구사항) */}
        <View style={styles.headerSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ height: spacing.xl }} />

        <CompleteCard
          title="챌린지 이름"
          value={challengeName}
          iconName="alarm-outline"
          iconBgColor="#007AFF"
        />

        <CompleteCard
          title="읽을 성경"
          value={booksText}
          iconName="book-outline"
          iconBgColor="#007AFF"
        />

        <CompleteCard
          title="읽을 기간"
          value={durationText}
          iconName="disc-outline"
          iconBgColor="#FF3B30"
        />

        <CompleteCard
          title="알람"
          value={alarmText}
          iconName="alarm-outline"
          iconBgColor="#007AFF"
        />

        <CompleteCard
          title="공개여부"
          value={visibilityText}
          iconName="people"
          iconBgColor="#FF9500"
          rightComponent={
            visibility === 'link' ? (
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink} activeOpacity={0.7}>
                <Text style={styles.copyBtnText}>링크 복사하기</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </ScrollView>

      {/* 하단 영역 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity style={styles.editLinkBtn} onPress={handleEdit} activeOpacity={0.7}>
          <Text style={styles.editLinkText}>챌린지 내용 수정하기</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.btnTextCancel}>다음에 읽기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnActive]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextActive}>성경 읽으러 가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerSpace: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  // 카드 컴포넌트
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  rightComponent: {
    marginLeft: spacing.sm,
  },
  copyBtn: {
    backgroundColor: '#F0F0F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  copyBtnText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },

  // 하단
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  editLinkBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  editLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.primaryLight,
  },
  btnTextCancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnTextActive: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
