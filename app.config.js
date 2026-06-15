// 동적 설정 — app.json을 그대로 쓰되, EAS 빌드에서 GOOGLE_SERVICES_JSON 파일 시크릿을
// android.googleServicesFile 로 주입한다. (google-services.json은 gitignore 유지)
// 로컬(prebuild 등)에서는 디스크의 ./google-services.json(app.json 값)로 폴백.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
