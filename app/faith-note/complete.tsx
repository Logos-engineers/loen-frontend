import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop, SvgXml } from 'react-native-svg';

// Figma 책 일러스트 (node 7097:101785). backdrop-blur(foreignObject)만 제거한 실제 에셋.
// 보라 그라데이션 backdrop + 오른쪽 페이지(흰 40%) + 왼쪽 페이지(흰) + 페이지 테두리(mask)
const BOOK_SVG = `<svg width="180" height="137" viewBox="0 0 180 137" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M96.1769 136.8C98.5178 136.8 100.709 135.924 102.502 134.547C109.917 128.852 119.317 125.7 129.068 125.7H170.18C175.601 125.7 179.998 121.671 179.998 116.706V10.8047C179.998 5.28184 175.521 0.804688 169.998 0.804688H113.508L102.508 3.40039L90.0078 11.4004L66.5078 0.804688H10C4.47715 0.804688 0 5.28184 0 10.8047V116.706C0 121.671 4.39752 125.7 9.81819 125.7H50.9306C60.6816 125.7 70.0812 128.857 77.4965 134.547C79.2896 135.924 81.4807 136.8 83.8215 136.8H96.1769Z" fill="url(#paint0_linear_book)"/>
<g>
<mask id="path-2-inside-1_book" fill="white">
<path d="M90 127.806C97.7564 120.701 108.277 116.706 119.248 116.706H170.178C175.599 116.706 179.997 112.678 179.997 107.712V8.99376C179.997 4.02826 175.599 0 170.178 0H119.248C108.277 0 97.7564 3.99039 90 11.1002"/>
</mask>
<path d="M90 127.806C97.7564 120.701 108.277 116.706 119.248 116.706H170.178C175.599 116.706 179.997 112.678 179.997 107.712V8.99376C179.997 4.02826 175.599 0 170.178 0H119.248C108.277 0 97.7564 3.99039 90 11.1002" fill="white" fill-opacity="0.4"/>
<path d="M89.6623 127.437L89.2936 127.775L89.969 128.513L90.3377 128.175L90 127.806L89.6623 127.437ZM89.6621 10.7316L89.2936 11.0695L89.9693 11.8066L90.3379 11.4688L90 11.1002L89.6621 10.7316ZM90 127.806L90.3377 128.175C97.9977 121.158 108.397 117.206 119.248 117.206V116.706V116.206C108.158 116.206 97.515 120.244 89.6623 127.437L90 127.806ZM119.248 116.706V117.206H170.178V116.706V116.206H119.248V116.706ZM170.178 116.706V117.206C175.833 117.206 180.497 112.994 180.497 107.712H179.997H179.497C179.497 112.361 175.365 116.206 170.178 116.206V116.706ZM179.997 107.712H180.497V8.99376H179.997H179.497V107.712H179.997ZM179.997 8.99376H180.497C180.497 3.71174 175.833 -0.5 170.178 -0.5V0V0.5C175.365 0.5 179.497 4.34477 179.497 8.99376H179.997ZM170.178 0V-0.5H119.248V0V0.5H170.178V0ZM119.248 0V-0.5C108.158 -0.5 97.5151 3.53331 89.6621 10.7316L90 11.1002L90.3379 11.4688C97.9977 4.44746 108.396 0.5 119.248 0.5V0Z" fill="white" mask="url(#path-2-inside-1_book)"/>
</g>
<mask id="path-4-inside-2_book" fill="white">
<path d="M90.0018 127.806C82.2454 120.701 71.7245 116.706 60.7539 116.706H9.81819C4.39752 116.706 0 112.678 0 107.712V8.99376C0 4.02826 4.39752 0 9.81819 0H60.7488C71.7193 0 82.2403 3.99039 89.9966 11.1002"/>
</mask>
<path d="M90.0018 127.806C82.2454 120.701 71.7245 116.706 60.7539 116.706H9.81819C4.39752 116.706 0 112.678 0 107.712V8.99376C0 4.02826 4.39752 0 9.81819 0H60.7488C71.7193 0 82.2403 3.99039 89.9966 11.1002" fill="white"/>
<path d="M90.0018 127.806L90.3395 127.437C82.4868 120.244 71.8437 116.206 60.7539 116.206V116.706V117.206C71.6052 117.206 82.0041 121.158 89.6641 128.175L90.0018 127.806ZM60.7539 116.706V116.206H9.81819V116.706V117.206H60.7539V116.706ZM9.81819 116.706V116.206C4.63147 116.206 0.5 112.361 0.5 107.712H0H-0.5C-0.5 112.994 4.16356 117.206 9.81819 117.206V116.706ZM0 107.712H0.5V8.99376H0H-0.5V107.712H0ZM0 8.99376H0.5C0.5 4.34477 4.63147 0.5 9.81819 0.5V0V-0.5C4.16356 -0.5 -0.5 3.71174 -0.5 8.99376H0ZM9.81819 0V0.5H60.7488V0V-0.5H9.81819V0ZM60.7488 0V0.5C71.6002 0.5 81.999 4.44746 89.6588 11.4688L89.9966 11.1002L90.3345 10.7316C82.4816 3.53331 71.8384 -0.5 60.7488 -0.5V0Z" fill="white" mask="url(#path-4-inside-2_book)"/>
<defs>
<linearGradient id="paint0_linear_book" x1="177.415" y1="0.804689" x2="2.58327" y2="136.8" gradientUnits="userSpaceOnUse">
<stop stop-color="#6561FF" stop-opacity="0"/>
<stop offset="0.714437" stop-color="#6561FF"/>
</linearGradient>
</defs>
</svg>`;

// 현재 날짜 포맷: "YYYY년 M월 D일"
function getKoreanDate(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompleteScreen() {
  const { noteType } = useLocalSearchParams<{ noteType?: string }>();
  const noteLabel = noteType === 'PRAYER' ? '기도노트' : noteType === 'WORD' ? '말씀노트' : '감사노트';
  const today = getKoreanDate();

  // 작성 완료 화면을 잠시 보여준 뒤 메인(홈)으로 자동 이동.
  // (이 화면엔 별도 네비게이션이 없어, 없으면 사용자가 갇혀 저장이 안 된 것처럼 보임)
  // 1.5초는 (특히 링크 공유 시트 닫은 직후) 너무 빨라 완료 화면을 못 보고 지나감 → 2.5초.
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  // 컨테이너 실측 크기 + 책 중심 측정 → 그라데이션을 책 중심에 정확히 정렬 (좌표 압축 방지, 반응형)
  const [{ w, h }, setLayout] = useState({ w: 0, h: 0 });
  const [bookCenterY, setBookCenterY] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View
        style={styles.container}
        onLayout={(e) =>
          setLayout({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        {/* 라디얼 그라데이션 — 컨테이너와 동일 좌표계, 중심을 책 중심(bookCenterY)에 정렬 */}
        {h > 0 && (
          <Svg width={w} height={h} style={styles.gradientLayer} pointerEvents="none">
            <Defs>
              <RadialGradient
                id="bgGrad"
                cx={w / 2}
                cy={bookCenterY ?? h * 0.48}
                r={h * 0.5}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#E0DFFF" />
                <Stop offset="1" stopColor="#F2F4F7" />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={w} height={h} fill="url(#bgGrad)" />
          </Svg>
        )}

        {/* 위 영역 — Figma 비율(340). 타이틀을 상단에 배치 */}
        <View style={styles.aboveRegion}>
          <View style={styles.titleSection}>
            <Text style={styles.date}>{today}</Text>
            <Text style={styles.title}>{noteLabel} 작성 완료</Text>
          </View>
        </View>

        {/* 책 일러스트 — 위:아래 = 340:375 → 화면 세로 ~48%(중앙)에 위치 */}
        <View
          style={styles.bookWrap}
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setBookCenterY(y + height / 2);
          }}
        >
          <SvgXml xml={BOOK_SVG} width={180} height={137} />
        </View>

        {/* 아래 영역 — Figma 비율(375) */}
        <View style={styles.belowRegion} />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  container: { flex: 1 },
  // 그라데이션 레이어 — 컨테이너 전체를 덮음 (width/height는 실측값으로 지정)
  gradientLayer: { position: 'absolute', top: 0, left: 0 },

  // Figma 비율: 책 위 340 : 아래 375 → 책이 화면 세로 ~48%에 위치 (반응형)
  aboveRegion: {
    flex: 340,
    paddingTop: 62, // Figma: 빈 네비게이션(46) + 타이틀 섹션 상단 패딩(16)
    alignItems: 'center',
  },
  belowRegion: { flex: 375 },
  titleSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  bookWrap: { alignItems: 'center' },
  date: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  // Figma: Screen Title 32_B
  title: {
    fontSize: 32,
    lineHeight: 48,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },

});
