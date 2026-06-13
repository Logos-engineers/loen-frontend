import { Card } from '@/components/ui/card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { fetchCurrentObsContent, formatWeekLabel } from '@/hooks/useObs';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import type { ObsContentDetail } from '@/utils/obs-normalize';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function GoalSection() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [obs, setObs] = useState<ObsContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    fetchCurrentObsContent()
      .then(setObs)
      .catch(() => setObs(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useRefetchOnFocus(load);

  // 적용하기 입력값 (OBS 보기 플로우 마지막 단계에서 사용자가 직접 작성)
  const applicationAnswer = obs?.applicationAnswer?.trim() ?? '';
  const hasApplication = applicationAnswer.length > 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
  };

  // 이번 주 적용하기 미입력 → OBS 보기 플로우 시작 화면(intro)으로 이동.
  // origin: 'home' → 플로우 종료/이탈 시 OBS 목록이 아니라 홈으로 복귀.
  const goToObsFlow = () => {
    if (!obs) return;
    router.push({
      pathname: '/obs/content/intro',
      params: {
        contentId: String(obs.id),
        title: obs.title,
        verse: obs.biblePassage,
        weekLabel: formatWeekLabel(obs.publishedDate),
        origin: 'home',
      },
    });
  };

  const handlePress = () => {
    if (isLoading) return;
    if (hasApplication) toggle();
    else if (obs) goToObsFlow();
    else router.push('/obs');  // 이번 주 교안이 없으면 OBS 목록으로
  };

  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
          <Text style={styles.title}>적용하기</Text>
          <View style={styles.right}>
            <Text style={styles.subtitle}>
              {hasApplication ? '이번 주 목표 확인하기' : '이번 주 적용하기 입력하기'}
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text.secondary} />
            ) : (
              <Ionicons
                // 입력값 있으면 펼침(▼/▲), 없으면 이동(›)
                name={hasApplication ? (isOpen ? 'chevron-up' : 'chevron-down') : 'chevron-forward'}
                size={14}
                color={colors.text.secondary}
              />
            )}
          </View>
        </TouchableOpacity>

        {hasApplication && isOpen && (
          <View style={styles.listContainer}>
            {/* 사용자가 입력한 그대로 자유 형식으로 표시 */}
            <Text style={styles.answerText}>{applicationAnswer}</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,    // rgba(13,28,45,0.8)
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Figma: trans/gray/a3 — 회색 (보라 아님!)
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,  // rgba(13,28,45,0.5)
  },
  listContainer: {
    marginTop: spacing.md,
  },
  answerText: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
    color: colors.text.primary,
  },
});
