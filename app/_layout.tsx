import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

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
          <Stack.Screen name="obs/index" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal" options={{ headerShown: false }} />
          <Stack.Screen name="plan/goal-success" options={{ headerShown: false }} />
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
