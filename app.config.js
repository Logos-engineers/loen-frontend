// 동적 Expo 설정 — app.json(정적 베이스)을 받아 환경(dev/prod)별로 덮어쓴다.
//
// 스위치는 APP_ENV 하나:
//   APP_ENV=production      → 출시/베타 앱 (com.loen.app,     Railway 백엔드)
//   그 외(기본 development)  → 개발 앱      (com.loen.app.dev, Pi dev 백엔드)
//
// 두 앱은 bundleId/package 가 달라 한 폰에 동시 설치된다.
// 런타임 값(API URL, Google client id)은 EXPO_PUBLIC_* 환경변수로,
// google-services.json 은 EAS 의 GOOGLE_SERVICES_JSON 파일 시크릿(환경별)으로 주입된다.

const IS_DEV = (process.env.APP_ENV ?? 'development') !== 'production';

const BUNDLE_ID = IS_DEV ? 'com.loen.app.dev' : 'com.loen.app';

// iOS 구글 로그인용 URL scheme = iOS client id 를 뒤집은 값.
// 환경변수(EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)에서 자동 계산 → dev/prod 가 알아서 갈림.
function googleIosUrlScheme() {
  const id = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!id) return null;
  return `com.googleusercontent.apps.${id.replace(/\.apps\.googleusercontent\.com$/, '')}`;
}

module.exports = ({ config }) => {
  const iosScheme = googleIosUrlScheme();
  return {
    ...config,
    name: IS_DEV ? 'Loen (Dev)' : 'Loen',
    // 딥링크 scheme 도 분리 — 같은 폰에서 dev/prod 가 서로의 링크를 가로채지 않게.
    scheme: IS_DEV ? 'loenprojectdev' : config.scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: BUNDLE_ID,
      infoPlist: {
        ...config.ios?.infoPlist,
        // iOS 구글 로그인 콜백 scheme — 환경변수 기반이라 dev/prod 자동 분기.
        CFBundleURLTypes: iosScheme
          ? [{ CFBundleURLSchemes: [iosScheme] }]
          : config.ios?.infoPlist?.CFBundleURLTypes,
      },
    },
    android: {
      ...config.android,
      package: BUNDLE_ID,
      // EAS: GOOGLE_SERVICES_JSON(환경별 파일 시크릿) 우선 → 로컬은 dev/prod 파일로 폴백.
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ??
        (IS_DEV ? './google-services.dev.json' : './google-services.json'),
    },
  };
};
