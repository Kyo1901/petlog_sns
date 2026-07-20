/**
 * Unsplash API 유틸리티 (게시물 사진 검색용)
 * - Access Key는 .env 의 VITE_UNSPLASH_ACCESS_KEY 에서 읽는다
 */

const BASE_URL = 'https://api.unsplash.com';

/** Unsplash Access Key 설정 여부 */
export function hasUnsplashKey() {
  return Boolean(import.meta.env.VITE_UNSPLASH_ACCESS_KEY);
}

/** 키워드로 Unsplash 사진 검색 */
export async function searchUnsplashPhotos(query, page = 1, perPage = 24) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error('Unsplash Access Key가 설정되지 않았습니다.');
  }
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
  });
  const response = await fetch(`${BASE_URL}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!response.ok) {
    throw new Error(`Unsplash 검색에 실패했습니다 (${response.status})`);
  }
  const data = await response.json();
  return {
    total: data.total,
    totalPages: data.total_pages,
    photos: (data.results ?? []).map((photo) => ({
      id: photo.id,
      thumbUrl: photo.urls.small,
      imageUrl: photo.urls.regular,
      description: photo.alt_description ?? 'Unsplash 사진',
      author: photo.user?.name ?? '',
    })),
  };
}
