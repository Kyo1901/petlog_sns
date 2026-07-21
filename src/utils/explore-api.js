import { supabase } from '../lib/supabase';
import { POST_SELECT, fetchPosts, normalizePost } from './posts-api';

/**
 * 탐색 · 검색 관련 Supabase API 유틸리티 (2차 개발)
 * - 인기 해시태그 / 해시태그 · 펫 이름 검색 / 추천 펫 / 태그 · 카테고리별 게시물
 */

const PET_SELECT = `
  id, user_id, name, species, breed, profile_image_url, bio,
  followers:petlog_follows!following_pet_id (count)
`;

/** 펫 조회 결과에 팔로워 수를 평탄화해서 정리 */
function normalizePet(pet) {
  return { ...pet, followers_count: pet.followers?.[0]?.count ?? 0 };
}

/** 해시태그 조회 결과에 게시물 수를 평탄화해서 정리 */
function normalizeHashtag(tag) {
  return { id: tag.id, tag_name: tag.tag_name, post_count: tag.usage?.[0]?.count ?? 0 };
}

/** 인기 해시태그 조회 (연결된 게시물 수 내림차순) */
export async function fetchPopularHashtags(limit = 10) {
  const { data, error } = await supabase
    .from('petlog_hashtags')
    .select('id, tag_name, usage:petlog_post_hashtags (count)');
  if (error) throw error;
  return (data ?? [])
    .map(normalizeHashtag)
    .filter((tag) => tag.post_count > 0)
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, limit);
}

/** 해시태그 키워드 검색 (부분 일치, 게시물 수 포함) */
export async function searchHashtagsByKeyword(keyword) {
  const name = keyword.trim().replace(/^#/, '');
  if (!name) return [];
  const { data, error } = await supabase
    .from('petlog_hashtags')
    .select('id, tag_name, usage:petlog_post_hashtags (count)')
    .ilike('tag_name', `%${name}%`)
    .limit(10);
  if (error) throw error;
  return (data ?? [])
    .map(normalizeHashtag)
    .sort((a, b) => b.post_count - a.post_count);
}

/** 펫 이름 검색 (부분 일치, 팔로워 수 포함) */
export async function searchPetsByName(keyword) {
  const name = keyword.trim();
  if (!name) return [];
  const { data, error } = await supabase
    .from('petlog_pet_profiles')
    .select(PET_SELECT)
    .ilike('name', `%${name}%`)
    .limit(10);
  if (error) throw error;
  return (data ?? []).map(normalizePet);
}

/**
 * 팔로우할 만한 펫 프로필 추천
 * - 내 펫과 이미 팔로우 중인 펫을 제외하고 팔로워 수 순으로 추천
 */
export async function fetchRecommendedPets({ myUserId, followingPetIds = [], limit = 10 } = {}) {
  const { data, error } = await supabase
    .from('petlog_pet_profiles')
    .select(PET_SELECT)
    .limit(50);
  if (error) throw error;
  const followingSet = new Set(followingPetIds);
  return (data ?? [])
    .map(normalizePet)
    .filter((pet) => pet.user_id !== myUserId && !followingSet.has(pet.id))
    .sort((a, b) => b.followers_count - a.followers_count)
    .slice(0, limit);
}

/** 특정 해시태그가 달린 게시물 조회 (페이지네이션) */
export async function fetchPostsByTag(tagName, { page = 0, pageSize = 21 } = {}) {
  const name = tagName.trim().replace(/^#/, '');
  if (!name) return [];
  const { data: tag } = await supabase
    .from('petlog_hashtags')
    .select('id')
    .eq('tag_name', name)
    .maybeSingle();
  if (!tag) return [];
  const { data: links, error: linkError } = await supabase
    .from('petlog_post_hashtags')
    .select('post_id')
    .eq('hashtag_id', tag.id);
  if (linkError) throw linkError;
  const postIds = (links ?? []).map((row) => row.post_id);
  if (!postIds.length) return [];
  const { data, error } = await supabase
    .from('petlog_posts')
    .select(POST_SELECT)
    .in('id', postIds)
    .order('created_at', { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);
  if (error) throw error;
  return (data ?? []).map(normalizePost);
}

/** 카테고리(동물 종류)별 게시물 조회 — 해당 종의 펫 id 목록으로 필터 */
export async function fetchPostsBySpecies(species, { page = 0, pageSize = 21 } = {}) {
  const { data: petRows, error } = await supabase
    .from('petlog_pet_profiles')
    .select('id')
    .eq('species', species);
  if (error) throw error;
  const petIds = (petRows ?? []).map((row) => row.id);
  if (!petIds.length) return [];
  return fetchPosts({ followingPetIds: petIds, page, pageSize });
}
