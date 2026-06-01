/**
 * components/ui/overlay/OverlayHost.tsx
 * 명령형 오버레이(toast/snackbar/floating)를 화면 최상단에 1회 렌더하는 호스트.
 * _layout.tsx 루트에 마운트. overlay-store의 current를 구독해 위치/애니메이션/자동 닫힘 처리.
 */

import Floating from '@/components/ui/overlay/Floating';
import { useOverlayStore } from '@/components/ui/overlay/overlay-store';
import Snackbar from '@/components/ui/overlay/Snackbar';
import Toast from '@/components/ui/overlay/Toast';
import { spacing } from '@/constants/tokens';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OverlayHost() {
  const current = useOverlayStore((s) => s.current);
  const dismiss = useOverlayStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, current.duration);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  const top = current?.position === 'top';

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {current && (
        <Animated.View
          key={current.id}
          entering={(top ? FadeInUp : FadeInDown).duration(220)}
          exiting={(top ? FadeOutUp : FadeOutDown).duration(180)}
          pointerEvents="box-none"
          style={[
            styles.slot,
            top
              ? { top: insets.top + spacing.sm }
              : { bottom: insets.bottom + spacing.md },
          ]}
        >
          {current.kind === 'toast' && <Toast message={current.message} />}
          {current.kind === 'snackbar' && (
            <Snackbar message={current.message} action={current.action} />
          )}
          {current.kind === 'floating' && <Floating message={current.message} />}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
});
