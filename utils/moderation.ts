/**
 * moderation — UGC 신고/차단 API (Apple 가이드라인 1.2 대응).
 * 백엔드: POST /reports, POST /blocks, DELETE /blocks/{id}, GET /blocks
 */
import { apiClient } from '@/utils/apiClient';

export type ReportTargetType =
  | 'CERTIFICATION'
  | 'CERTIFICATION_COMMENT'
  | 'NOTE'
  | 'NOTE_COMMENT'
  | 'USER';

export type BlockedUser = {
  userId: string;
  nickname: string | null;
};

/** 신고 사유 프리셋 (신고 모달용) */
export const REPORT_REASONS = [
  '스팸/홍보',
  '욕설/비방',
  '음란물/부적절한 콘텐츠',
  '폭력/혐오',
  '기타',
] as const;

/** 콘텐츠/사용자 신고 */
export async function reportContent(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<void> {
  await apiClient<void>('/reports', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, reason }),
  });
}

/** 사용자 차단 */
export async function blockUser(blockedUserId: string): Promise<void> {
  await apiClient<void>('/blocks', {
    method: 'POST',
    body: JSON.stringify({ blockedUserId }),
  });
}

/** 사용자 차단 해제 */
export async function unblockUser(blockedUserId: string): Promise<void> {
  await apiClient<void>(`/blocks/${blockedUserId}`, { method: 'DELETE' });
}

/** 내가 차단한 사용자 목록 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  return apiClient<BlockedUser[]>('/blocks');
}
