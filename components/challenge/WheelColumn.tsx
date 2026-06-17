import React, { useEffect, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const AnimatedText = Animated.createAnimatedComponent(Text);

// 거리별 비주얼(현 디자인 유지): 폰트 23/18/14/12, 색 #16191C→#AEAEAE→#C2C2C2→#D7D7D7.
// 부드러운 추종을 위해 네이티브 드라이버로 scale(23 기준 비율) + opacity(흰 배경에서 회색 농도 근사)로 표현한다.
const BASE_FONT = 23;
const SELECTED_COLOR = '#16191C';
const DISABLED_OPACITY = 0.17; // ≈ #D7D7D7 on white

// inputRange: 중심에서 ±3칸. outputRange는 거리 0→3.
const SCALE_BY_DISTANCE = [1, 18 / BASE_FONT, 14 / BASE_FONT, 12 / BASE_FONT]; // 1, .78, .61, .52
const OPACITY_BY_DISTANCE = [1, 0.35, 0.26, 0.17]; // #AEAEAE/#C2C2C2/#D7D7D7 근사

type Props = {
  /** 표시할 라벨 목록 */
  items: readonly (string | number)[];
  /** 현재 선택 인덱스 (외부 제어값) */
  selectedIndex: number;
  /** 스크롤이 한 칸에 정착했을 때 호출 */
  onIndexChange: (index: number) => void;
  itemHeight: number;
  visibleItems: number;
  width: number;
  /** 해당 인덱스를 비활성(흐리게) 표시할지 */
  isDisabled?: (index: number) => boolean;
};

export default function WheelColumn({
  items,
  selectedIndex,
  onIndexChange,
  itemHeight,
  visibleItems,
  width,
  isDisabled,
}: Props) {
  const half = Math.floor(visibleItems / 2);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(selectedIndex * itemHeight)).current;
  const isDragging = useRef(false);

  // 외부에서 selectedIndex가 바뀌면(클램프/초기화 등, 사용자 스크롤이 아닐 때) 위치를 맞춘다.
  useEffect(() => {
    if (isDragging.current) return;
    scrollRef.current?.scrollTo({ y: selectedIndex * itemHeight, animated: false });
  }, [selectedIndex, itemHeight]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
  });

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDragging.current = false;
    const idx = Math.max(
      0,
      Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / itemHeight)),
    );
    if (idx !== selectedIndex) onIndexChange(idx);
  };

  return (
    <View style={{ width, height: itemHeight * visibleItems }}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        scrollEventThrottle={16}
        // 초기 위치(iOS는 contentOffset, Android는 위 useEffect의 scrollTo가 보강)
        contentOffset={{ x: 0, y: selectedIndex * itemHeight }}
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          isDragging.current = true;
        }}
        // 모멘텀이 거의 없는(천천히 놓은) 드래그면 여기서 정착. 모멘텀이 있으면 onMomentumScrollEnd가 처리.
        onScrollEndDrag={(e) => {
          const v = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(v) < 0.05) settle(e);
        }}
        onMomentumScrollEnd={settle}
        contentContainerStyle={{ paddingVertical: itemHeight * half }}
      >
        {items.map((label, i) => {
          const inputRange = [
            (i - 3) * itemHeight,
            (i - 2) * itemHeight,
            (i - 1) * itemHeight,
            i * itemHeight,
            (i + 1) * itemHeight,
            (i + 2) * itemHeight,
            (i + 3) * itemHeight,
          ];
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [
              SCALE_BY_DISTANCE[3], SCALE_BY_DISTANCE[2], SCALE_BY_DISTANCE[1],
              SCALE_BY_DISTANCE[0],
              SCALE_BY_DISTANCE[1], SCALE_BY_DISTANCE[2], SCALE_BY_DISTANCE[3],
            ],
            extrapolate: 'clamp',
          });
          const animatedOpacity = scrollY.interpolate({
            inputRange,
            outputRange: [
              OPACITY_BY_DISTANCE[3], OPACITY_BY_DISTANCE[2], OPACITY_BY_DISTANCE[1],
              OPACITY_BY_DISTANCE[0],
              OPACITY_BY_DISTANCE[1], OPACITY_BY_DISTANCE[2], OPACITY_BY_DISTANCE[3],
            ],
            extrapolate: 'clamp',
          });
          const disabled = isDisabled?.(i) ?? false;
          return (
            <View key={`${label}-${i}`} style={[styles.item, { height: itemHeight }]}>
              <AnimatedText
                style={[
                  styles.itemText,
                  {
                    transform: [{ scale }],
                    opacity: disabled ? DISABLED_OPACITY : animatedOpacity,
                  },
                ]}
              >
                {label}
              </AnimatedText>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', justifyContent: 'center' },
  itemText: {
    fontSize: BASE_FONT,
    fontWeight: '400',
    color: SELECTED_COLOR,
    // 안드로이드에서 scale 시 글자 잘림 방지용 여유
    ...Platform.select({ android: { includeFontPadding: false } }),
  },
});
