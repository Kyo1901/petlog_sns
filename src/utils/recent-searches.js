/**
 * 최근 검색어 localStorage 유틸리티 (탐색 페이지 검색창 드롭다운용)
 * - 최신순으로 최대 10개 유지, 중복 검색어는 맨 앞으로 이동
 */

const STORAGE_KEY = 'petlog_recent_searches';
const MAX_ITEMS = 10;

/** 최근 검색어 목록 조회 (최신순) */
export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 검색어 추가 후 갱신된 목록 반환 */
export function addRecentSearch(keyword) {
  const name = keyword.trim();
  if (!name) return getRecentSearches();
  const next = [name, ...getRecentSearches().filter((item) => item !== name)].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** 검색어 1개 삭제 후 갱신된 목록 반환 */
export function removeRecentSearch(keyword) {
  const next = getRecentSearches().filter((item) => item !== keyword);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** 최근 검색어 전체 삭제 */
export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
