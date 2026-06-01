import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Figma 완료 화면 행 아이콘 (40×40 일러스트)
const RESULT_ICONS = {
  name: require('@/assets/images/challenge-result/name.png'),
  bible: require('@/assets/images/challenge-result/bible.png'),
  period: require('@/assets/images/challenge-result/period.png'),
  alarm: require('@/assets/images/challenge-result/alarm.png'),
  visibility: require('@/assets/images/challenge-result/visibility.png'),
} as const;

type CompleteCardProps = {
  title: string;
  value: string;
  icon: ImageSourcePropType;
  rightComponent?: React.ReactNode;
};

const CompleteCard = ({ title, value, icon, rightComponent }: CompleteCardProps) => (
  <View style={styles.card}>
    <Image source={icon} style={styles.iconBox} resizeMode="contain" />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue} numberOfLines={1}>{value}</Text>
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

      {/* 배경 그라데이션 (Figma radial #E0DFFF 중앙 → #F2F4F7 — 3-스톱 세로로 근사) */}
      <LinearGradient
        colors={['#F2F4F7', '#E0DFFF', '#F2F4F7']}
        locations={[0.18, 0.5, 0.84]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>성경 챌린지 만들기 완료</Text>

        <CompleteCard
          title="챌린지 이름"
          value={challengeName}
          icon={RESULT_ICONS.name}
        />

        <CompleteCard
          title="읽을 성경"
          value={booksText}
          icon={RESULT_ICONS.bible}
        />

        <CompleteCard
          title="읽을 기간"
          value={durationText}
          icon={RESULT_ICONS.period}
        />

        <CompleteCard
          title="알람"
          value={alarmText}
          icon={RESULT_ICONS.alarm}
        />

        <CompleteCard
          title="공개여부"
          value={visibilityText}
          icon={RESULT_ICONS.visibility}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 32,
    lineHeight: 48,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center', // Figma: textAlignHorizontal CENTER
    paddingHorizontal: spacing.xs,
    marginTop: 78, // Figma: 상태바 아래 빈 네비(46) + 패딩(32)
    marginBottom: spacing.xxl, // Figma: 타이틀→첫 카드 32
  },

  // 카드 컴포넌트
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 17, // Figma Container gap
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    marginRight: spacing.sm, // Figma: left 프레임 우패딩 8
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  cardValue: {
    fontSize: fontSize.base,
    lineHeight: 26, // Figma lh 25.6 — 라벨과 라인높이로 직접 스택
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  rightComponent: {
    marginLeft: spacing.sm,
  },
  copyBtn: {
    backgroundColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  copyBtnText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },

  // 하단
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  editLinkBtn: {
    alignSelf: 'center',
    paddingTop: spacing.smmd,    // 12 — Figma above frame pad-top
    paddingBottom: spacing.sm,   // 8  — 버튼 바로 위
  },
  editLinkText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 49,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.primaryLight,
  },
  btnTextCancel: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnTextActive: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
