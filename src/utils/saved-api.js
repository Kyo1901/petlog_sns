import { supabase } from '../lib/supabase';
import { POST_SELECT, normalizePost } from './posts-api';

/**
 * 게시물 저장 · 컬렉션 관련 Supabase API 유틸리티 (2차 개발)
 * - 저장은 펫이 아닌 보호자(petlog_users) 단위
 */

/** 내 컬렉션 목록 (저장 게시물 수 포함) */
export async function fetchCollections(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('petlog_collections')
    .select('id, name, saved:petlog_saved_posts (count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    saved_count: row.saved?.[0]?.count ?? 0,
  }));
}

/** 컬렉션 생성 */
export async function createCollection(userId, name) {
  const { data, error } = await supabase
    .from('petlog_collections')
    .insert({ user_id: userId, name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** 내가 저장한 게시물 id 집합 (피드 북마크 표시용) */
export async function fetchSavedPostIds(userId, postIds) {
  if (!userId || !postIds.length) return new Set();
  const { data } = await supabase
    .from('petlog_saved_posts')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  return new Set((data ?? []).map((row) => row.post_id));
}

/**
 * 저장한 게시물 목록 (최근 저장순)
 * - collectionId: undefined = 전체, null = 미분류, 숫자 = 해당 컬렉션
 */
export async function fetchSavedPosts({ userId, collectionId }) {
  if (!userId) return [];
  let query = supabase
    .from('petlog_saved_posts')
    .select(`id, collection_id, post:petlog_posts (${POST_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (collectionId === null) query = query.is('collection_id', null);
  else if (collectionId !== undefined) query = query.eq('collection_id', collectionId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? [])
    .filter((row) => row.post)
    .map((row) => normalizePost(row.post));
}

/** 게시물 저장 (이미 저장돼 있으면 컬렉션만 변경) */
export async function savePost({ userId, postId, collectionId = null }) {
  const { error } = await supabase
    .from('petlog_saved_posts')
    .upsert(
      { user_id: userId, post_id: postId, collection_id: collectionId },
      { onConflict: 'user_id,post_id' },
    );
  if (error) throw error;
}

/** 게시물 저장 해제 */
export async function unsavePost(userId, postId) {
  const { error } = await supabase
    .from('petlog_saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
}
