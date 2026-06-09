import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Notifications from '@/utils/notifications';
import { apiClient } from '@/utils/apiClient';

type Platform0 = 'IOS' | 'ANDROID' | 'WEB';

function resolvePlatform(): Platform0 {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'WEB';
}

/**
 * 앱 진입(로그인 상태) 시 Expo 푸시 토큰을 발급받아 백엔드에 등록한다.
 * 권한 미허용/Expo Go Android/발급 실패는 graceful 하게 무시(best-effort).
 */
export async function registerPushToken(): Promise<void> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing?.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: true },
      });
      status = requested?.status;
    }
    if (status !== 'granted') return;

    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse?.data;
    if (!token) return; // Expo Go Android mock 등 → 빈 토큰

    await apiClient('/users/me/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform: resolvePlatform() }),
    });
  } catch (e) {
    console.warn('[usePushToken] 푸시 토큰 등록 실패', e);
  }
}
