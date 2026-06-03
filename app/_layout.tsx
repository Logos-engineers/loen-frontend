import * as Notifications from '@/utils/notifications';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { OverlayHost } from '@/components/ui/overlay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkInAttendance } from '@/hooks/useAttendance';
import { registerPushToken } from '@/hooks/usePushToken';
import { useAuthStore } from '@/store/auth-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isNewUser, isInitialized, initialize } = useAuthStore();
  // 루트 네비게이터(Stack)가 마운트된 뒤에만 navigate 해야 함 (마운트 전 router.replace 시 크래시)
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!rootNavState?.key) return; // 네비게이터 마운트 전이면 대기
    if (!isInitialized) return;

    if (!isLoggedIn) {
      router.replace('/login');
    } else if (isNewUser) {
      router.replace('/profile-setup');
    } else {
      router.replace('/(tabs)');
    }
  }, [isInitialized, isLoggedIn, isNewUser, rootNavState?.key]);

  // 앱 진입(로그인 상태) 기준 출석 체크 — 하루 1회 멱등 처리
  useEffect(() => {
    if (isInitialized && isLoggedIn && !isNewUser) {
      checkInAttendance();
      registerPushToken();
    }
  }, [isInitialized, isLoggedIn, isNewUser]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data ?? {};
      const type = data.type;
      if (type === 'bible-plan') {
        router.push('/(tabs)/plan');
      } else if (type === 'NOTE_COMMENT') {
        if (data.targetId && data.targetType) {
          router.push({ pathname: '/faith-note/[id]', params: { id: data.targetId, tab: data.targetType } });
        } else {
          router.push('/faith-note');
        }
      } else {
        router.push('/notifications');
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="bible" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/index" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/create" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/list" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/bible" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/faith" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/visibility" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/complete" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/edit" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/select-bible" options={{ headerShown: false }} />
          <Stack.Screen name="obs/index" options={{ headerShown: false }} />
          <Stack.Screen name="obs/content/intro" options={{ headerShown: false }} />
          <Stack.Screen name="obs/content/scripture" options={{ headerShown: false }} />
          <Stack.Screen name="obs/content/summary" options={{ headerShown: false }} />
          <Stack.Screen name="obs/content/finish" options={{ headerShown: false }} />
          <Stack.Screen name="obs/content/complete" options={{ headerShown: false }} />
          <Stack.Screen name="obs/quiz/intro" options={{ headerShown: false }} />
          <Stack.Screen name="obs/quiz/ox" options={{ headerShown: false }} />
          <Stack.Screen name="obs/quiz/multiple" options={{ headerShown: false }} />
          <Stack.Screen name="obs/quiz/essay" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal-success" options={{ headerShown: false }} />
          <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
          <Stack.Screen name="mypage/index" options={{ headerShown: false }} />
          <Stack.Screen name="mypage/edit" options={{ headerShown: false }} />
          <Stack.Screen name="mypage/settings" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/index" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/write-thanks" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/write-prayer" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/write-word" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/select-bible" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/publish" options={{ headerShown: false }} />
          <Stack.Screen name="faith-note/complete" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      <OverlayHost />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
