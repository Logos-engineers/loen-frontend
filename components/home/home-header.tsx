import { BELL_SVG } from '@/constants/icons';
import { colors } from '@/constants/tokens';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

export function HomeHeader() {
  const { count, refetch } = useUnreadCount();

  // 홈으로 돌아올 때마다 안 읽은 알림 수 갱신
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.container}>
      {/* onu 워드마크 로고 (928×294 비율, 연회색) */}
      <Image source={require('@/assets/images/home-logo.png')} style={styles.logo} contentFit="contain" />

      {/* 벨 아이콘 → 알림 센터, 안 읽은 알림 있으면 빨간 점 */}
      <TouchableOpacity
        onPress={() => router.push('/notifications')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <SvgXml xml={BELL_SVG} width={24} height={24} />
        {count > 0 ? <View style={styles.badge} /> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // height:46, px:16, bg:background.base(회색 — 페이지 배경과 통일), flex-row, justify:space-between, align:center
  container: {
    height: 46,
    backgroundColor: colors.background.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: {
    width: 32,
    height: 10,
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.reaction.red,
  },
});
