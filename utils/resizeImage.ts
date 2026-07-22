/**
 * resizeImage — 업로드 전 이미지 리사이즈/재압축.
 *
 * 갤러리 원본은 1.5~4MB에 이르러 업로드 트래픽·실패율을 키운다.
 * 업로드 직전 가로 최대 1080px로 줄이고 JPEG로 재압축해 파일 크기를 낮춘다.
 * (네이티브 모듈 expo-image-manipulator 사용 → OTA 불가, 새 빌드부터 반영)
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_WIDTH = 1080;
const COMPRESS = 0.7;

/**
 * 업로드용으로 이미지를 리사이즈/재압축한 새 URI를 돌려준다.
 * - 원본 width를 알고 그것이 MAX_WIDTH 이하면 업스케일을 피하고 재압축만 한다.
 * - 어떤 이유로든 실패하면 원본 URI로 폴백해 업로드 자체는 막지 않는다.
 *
 * @param uri   로컬 파일 URI (expo-image-picker asset.uri)
 * @param width 원본 가로 픽셀 (expo-image-picker asset.width) — 있으면 업스케일 방지에 사용
 */
export async function resizeForUpload(uri: string, width?: number): Promise<string> {
  try {
    let ctx = ImageManipulator.manipulate(uri);
    if (!width || width > MAX_WIDTH) {
      ctx = ctx.resize({ width: MAX_WIDTH });
    }
    const image = await ctx.renderAsync();
    const result = await image.saveAsync({ compress: COMPRESS, format: SaveFormat.JPEG });
    return result.uri;
  } catch {
    return uri;
  }
}
