/**
 * feedback — 인앱 피드백(버그/개선/기타) API.
 * 사용자: POST /feedbacks(멀티파트), GET /feedbacks/me
 * 관리자: GET /admin/feedbacks, PATCH /admin/feedbacks/{id}/status, DELETE /admin/feedbacks/{id}
 */
import { apiClient, apiClientFormData } from '@/utils/apiClient';

export type FeedbackCategory = 'BUG' | 'IMPROVEMENT' | 'ETC';
export type FeedbackStatus = 'RECEIVED' | 'IN_REVIEW' | 'RESOLVED' | 'DECLINED';

export const FEEDBACK_CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  BUG: '버그',
  IMPROVEMENT: '개선',
  ETC: '기타',
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  RECEIVED: '접수',
  IN_REVIEW: '검토중',
  RESOLVED: '반영',
  DECLINED: '반려',
};

/** 첨부 이미지 최대 장수 (백엔드와 동일하게 유지). */
export const MAX_FEEDBACK_IMAGES = 5;

export type MyFeedback = {
  id: string;
  category: FeedbackCategory;
  title: string;
  content: string | null;
  imageUrls: string[] | null;
  status: FeedbackStatus;
  adminNote: string | null;
  createdAt: string;
};

export type AdminFeedback = MyFeedback & {
  userId: string;
  userNickname: string | null;
  /** GitHub 이슈로 등록됐으면 채워짐(미등록이면 null). */
  githubIssueNumber: number | null;
  githubIssueUrl: string | null;
};

/** 피드백 제출 (스크린샷 uri 배열 동봉). */
export async function submitFeedback(params: {
  category: FeedbackCategory;
  title: string;
  content?: string;
  imageUris?: string[];
}): Promise<MyFeedback> {
  const formData = new FormData();
  formData.append('category', params.category);
  formData.append('title', params.title);
  if (params.content) formData.append('content', params.content);
  (params.imageUris ?? []).forEach((uri, i) => {
    formData.append('images', { uri, name: `feedback-${i}.jpg`, type: 'image/jpeg' } as any);
  });
  return apiClientFormData<MyFeedback>('/feedbacks', formData);
}

/** 작성자 본인 내역 + 처리 상태. */
export async function getMyFeedbacks(): Promise<MyFeedback[]> {
  return apiClient<MyFeedback[]>('/feedbacks/me');
}

// ─── 관리자 피드백함 ─────────────────────────────────────────────────────────

export type AdminFeedbackFilter = 'ALL' | FeedbackStatus;

/** 관리자: 피드백 목록 (기본 전체). */
export async function getAdminFeedbacks(status: AdminFeedbackFilter = 'ALL'): Promise<AdminFeedback[]> {
  const res = await apiClient<{ feedbacks: AdminFeedback[] } | AdminFeedback[]>(
    `/admin/feedbacks?status=${status}`,
  );
  return Array.isArray(res) ? res : (res?.feedbacks ?? []);
}

/** 관리자: 처리 상태 변경. */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  adminNote?: string,
): Promise<void> {
  await apiClient<void>(`/admin/feedbacks/${feedbackId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  });
}

/** 관리자: 피드백을 GitHub 이슈로 등록. (이미 등록됐으면 409) */
export async function createFeedbackGithubIssue(
  feedbackId: string,
): Promise<{ number: number; url: string }> {
  return apiClient<{ number: number; url: string }>(
    `/admin/feedbacks/${feedbackId}/github-issue`,
    { method: 'POST' },
  );
}

/** 관리자: 피드백 삭제. */
export async function deleteFeedback(feedbackId: string): Promise<void> {
  await apiClient<void>(`/admin/feedbacks/${feedbackId}`, { method: 'DELETE' });
}
