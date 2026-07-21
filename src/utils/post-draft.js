/**
 * 게시물 작성 임시저장 localStorage 유틸리티
 * - 새 게시물 작성 중 나갈 때 저장, 다시 진입하면 불러오기 제안
 */

const STORAGE_KEY = 'petlog_post_draft';

/** 임시저장 글 조회 (없으면 null) */
export function getPostDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const draft = raw ? JSON.parse(raw) : null;
    return draft && typeof draft === 'object' ? draft : null;
  } catch {
    return null;
  }
}

/** 임시저장 글 저장 */
export function savePostDraft({ petId, caption, location, imageUrls, tags }) {
  const draft = { petId, caption, location, imageUrls, tags, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

/** 임시저장 글 삭제 */
export function clearPostDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
