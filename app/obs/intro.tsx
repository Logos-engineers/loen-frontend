import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

import { startObsReview } from '@/hooks/useObs';

const BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.5"/></svg>`;

export default function ObsIntroScreen() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    contentId?: string;
    title?: string;
    verse?: string;
    weekLabel?: string;
    preview?: string;
  }>();
  const [isStarting, setIsStarting] = useState(false);
  const isPreview = params.preview === 'true';

  const handleStart = async () => {
    const contentId = Number(params.contentId);
    const nextParams = {
      contentId: String(contentId || 0),
      title: params.title,
      verse: params.verse,
      ...(isPreview ? { preview: 'true' } : {}),
    };

    if (isPreview) {
      router.push({ pathname: '/obs/scripture', params: nextParams });
      return;
    }

    if (!contentId) return;
    setIsStarting(true);
    try {
      const reviewId = await startObsReview(contentId);
      router.push({ pathname: '/obs/scripture', params: { ...nextParams, reviewId: String(reviewId) } });
    } catch {
      router.push({ pathname: '/obs/scripture', params: nextParams });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          <Defs>
            <RadialGradient id="bg" cx="50%" cy="52%" r="70%">
              <Stop offset="0%" stopColor="rgba(224,223,255,1)" />
              <Stop offset="100%" stopColor="rgba(242,244,247,1)" />
            </RadialGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#bg)" />
        </Svg>

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {/* 상단 네비게이션 */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <SvgXml xml={BACK_SVG} width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 타이틀 */}
          <View style={styles.titleSection}>
            {!!params.weekLabel && (
              <Text style={styles.weekLabel}>{params.weekLabel}</Text>
            )}
            <Text style={styles.title}>{params.title || 'OBS'}</Text>
            <Text style={styles.verse}>{params.verse || ''}</Text>
          </View>

          {/* 책 이미지 */}
          <View style={styles.imageSection}>
            <Image
              source={require('@/assets/icons/obs/obs_complete_book.png')}
              style={styles.bookImage}
              resizeMode="contain"
            />
          </View>

          {/* 하단 CTA */}
          <View style={styles.cta}>
            <TouchableOpacity
              style={styles.skipBtn}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.skipText}>다음에 할래요</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.85}
              onPress={handleStart}
              disabled={isStarting}
            >
              {isStarting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.startText}>OBS 시작하기</Text>
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  navBar: {
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 24,
    height: 24,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25.6,
    color: '#6561FF',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 48,
    color: 'rgba(13, 28, 45, 0.8)',
    textAlign: 'center',
  },
  verse: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 25.6,
    color: 'rgba(13, 28, 45, 0.5)',
    textAlign: 'center',
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookImage: {
    width: 160,
    height: 133,
  },
  cta: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    color: '#6561FF',
  },
  startBtn: {
    backgroundColor: '#6561FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  startText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 25.2,
    color: '#FFFFFF',
  },
});
