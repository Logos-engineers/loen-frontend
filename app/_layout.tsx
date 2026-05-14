import * as Notifications from '@/utils/notifications';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // 앱 백그라운드/종료 상태에서 알림 클릭 시 해당 탭으로 이동
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const type = response.notification.request.content.data?.type;
      if (type === 'bible-plan') {
        router.push('/(tabs)/plan');
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    // GestureHandlerRootView must wrap the entire app for Swipeable / GestureDetector to work
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
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
          <Stack.Screen name="obs/start" options={{ headerShown: false }} />
          <Stack.Screen name="obs/scripture" options={{ headerShown: false }} />
          <Stack.Screen name="obs/summary" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal-success" options={{ headerShown: false }} />
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
