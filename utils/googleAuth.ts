import Constants from 'expo-constants';

// Expo Go에서는 네이티브 Google Sign-In 모듈이 없으므로 조건부 로드
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

let GoogleSignin: any = null;
if (!IS_EXPO_GO) {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
}

/**
 * 구글 세션을 해제한다.
 * 이걸 호출하지 않으면 로그아웃 후 재로그인 시 직전 계정이 자동 선택되어
 * 계정 선택 화면이 뜨지 않는다.
 */
export async function googleSignOut(): Promise<void> {
  if (!GoogleSignin) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // 세션이 이미 없거나 Expo Go 등 — 무시 (로컬 토큰 제거가 우선)
  }
}
