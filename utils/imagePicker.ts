/**
 * imagePicker — expo-image-picker 안전 래퍼.
 *
 * New Architecture + Android 환경에서 호스트 액티비티가 재생성되면
 * expo-image-picker의 ActivityResultLauncher 등록이 풀려
 * "Attempting to launch an unregistered ActivityResultLauncher" 에러가
 * 간헐적으로 발생한다(권한 다이얼로그/구성 변경 등으로 액티비티 recreate 시).
 * 액티비티가 다시 그려지면 런처도 재등록되므로, 이 에러일 때 한 번만 재시도한다.
 */
import * as ImagePicker from 'expo-image-picker';

const isUnregisteredLauncherError = (e: unknown): boolean =>
  e instanceof Error && /unregistered ActivityResultLauncher/i.test(e.message);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** launchImageLibraryAsync — unregistered-launcher 에러 시 1회 재시도. */
export async function launchImageLibrarySafe(
  options: ImagePicker.ImagePickerOptions,
): Promise<ImagePicker.ImagePickerResult> {
  try {
    return await ImagePicker.launchImageLibraryAsync(options);
  } catch (e) {
    if (!isUnregisteredLauncherError(e)) throw e;
    // 액티비티 재생성 후 런처 재등록을 기다렸다가 한 번 더 시도
    await delay(300);
    return await ImagePicker.launchImageLibraryAsync(options);
  }
}
