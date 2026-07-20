import { supabase } from '../lib/supabase';

/**
 * 게시물 · 좋아요 · 팔로우 · 해시태그 관련 Supabase API 유틸리티
 */

const POST_SELECT = `
  *,
  pet:petlog_pet_profiles (id, name, species, breed, profile_image_url, user_id),
  images:petlog_post_images (id, image_url, sort_order),
  post_hashtags:petlog_post_hashtags (hashtag:petlog_hashtags (id, tag_name))
`;

/** 조회 결과를 화면에서 쓰기 좋은 형태로 정리 */
function normalizePost(post) {
  return {
    ...post,
    images: [...(post.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    hashtags: (post.post_hashtags ?? []).map((row) => row.hashtag).filter(Boolean),
  };
}

/** 피드 게시물 조회 (팔로잉 필터 / 특정 펫 필터 / 페이지네이션) */
export async function fetchPosts({ followingPetIds = null, petId = null, page = 0, pageSize = 10 } = {}) {
  if (followingPetIds && followingPetIds.length === 0) return [];
  let query = supabase
    .from('petlog_posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);
  if (followingPetIds) query = query.in('pet_id', followingPetIds);
  if (petId) query = query.eq('pet_id', petId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizePost);
}

/** 게시물 1건 조회 */
export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from('petlog_posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .single();
  if (error) throw error;
  return normalizePost(data);
}

/** 특정 펫의 게시물 수 */
export async function fetchPostCount(petId) {
  const { count } = await supabase
    .from('petlog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('pet_id', petId);
  return count ?? 0;
}

/** 내(현재 펫)가 좋아요한 게시물 id 집합 */
export async function fetchLikedPostIds(petId, postIds) {
  if (!petId || !postIds.length) return new Set();
  const { data } = await supabase
    .from('petlog_likes')
    .select('post_id')
    .eq('pet_id', petId)
    .in('post_id', postIds);
  return new Set((data ?? []).map((row) => row.post_id));
}

/** 좋아요 등록/취소 (likes_count 는 DB 트리거가 자동 갱신) */
export async function setLike(postId, petId, liked) {
  if (liked) {
    const { error } = await supabase
      .from('petlog_likes')
      .insert({ post_id: postId, pet_id: petId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase
      .from('petlog_likes')
      .delete()
      .eq('post_id', postId)
      .eq('pet_id', petId);
    if (error) throw error;
  }
}

/** 현재 펫이 팔로우 중인 펫 id 목록 */
export async function fetchFollowingIds(petId) {
  if (!petId) return [];
  const { data } = await supabase
    .from('petlog_follows')
    .select('following_pet_id')
    .eq('follower_pet_id', petId);
  return (data ?? []).map((row) => row.following_pet_id);
}

/** 팔로워 / 팔로잉 수 */
export async function fetchFollowCounts(petId) {
  const [followers, following] = await Promise.all([
    supabase
      .from('petlog_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_pet_id', petId),
    supabase
      .from('petlog_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_pet_id', petId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

/** 팔로우 여부 확인 */
export async function checkFollowing(followerPetId, followingPetId) {
  if (!followerPetId || !followingPetId) return false;
  const { data } = await supabase
    .from('petlog_follows')
    .select('id')
    .eq('follower_pet_id', followerPetId)
    .eq('following_pet_id', followingPetId)
    .maybeSingle();
  return Boolean(data);
}

/** 팔로우 / 언팔로우 */
export async function setFollow(followerPetId, followingPetId, follow) {
  if (follow) {
    const { error } = await supabase
      .from('petlog_follows')
      .insert({ follower_pet_id: followerPetId, following_pet_id: followingPetId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase
      .from('petlog_follows')
      .delete()
      .eq('follower_pet_id', followerPetId)
      .eq('following_pet_id', followingPetId);
    if (error) throw error;
  }
}

/** 게시물 이미지 저장 (sort_order 1부터) */
async function saveImages(postId, imageUrls) {
  if (!imageUrls.length) return;
  const rows = imageUrls.map((url, index) => ({
    post_id: postId,
    image_url: url,
    sort_order: index + 1,
  }));
  const { error } = await supabase.from('petlog_post_images').insert(rows);
  if (error) throw error;
}

/** 해시태그 저장 (사전에 없으면 생성 후 게시물과 연결) */
async function saveHashtags(postId, tagNames) {
  const names = [...new Set(tagNames.map((t) => t.trim().replace(/^#/, '')).filter(Boolean))];
  if (!names.length) return;
  const { data: existing } = await supabase
    .from('petlog_hashtags')
    .select('id, tag_name')
    .in('tag_name', names);
  const tagIdMap = new Map((existing ?? []).map((t) => [t.tag_name, t.id]));
  const missing = names.filter((name) => !tagIdMap.has(name));
  if (missing.length) {
    const { data: created } = await supabase
      .from('petlog_hashtags')
      .insert(missing.map((name) => ({ tag_name: name })))
      .select();
    (created ?? []).forEach((t) => tagIdMap.set(t.tag_name, t.id));
  }
  const rows = names
    .filter((name) => tagIdMap.has(name))
    .map((name) => ({ post_id: postId, hashtag_id: tagIdMap.get(name) }));
  if (rows.length) {
    const { error } = await supabase.from('petlog_post_hashtags').insert(rows);
    if (error) throw error;
  }
}

/** 게시물 작성 */
export async function createPost({ petId, caption, location, imageUrls, tagNames }) {
  const { data: post, error } = await supabase
    .from('petlog_posts')
    .insert({ pet_id: petId, caption, location: location || null })
    .select()
    .single();
  if (error) throw error;
  await saveImages(post.id, imageUrls);
  await saveHashtags(post.id, tagNames);
  return post;
}

/** 게시물 수정 (이미지 · 해시태그는 전체 교체) */
export async function updatePost({ postId, caption, location, imageUrls, tagNames }) {
  const { error } = await supabase
    .from('petlog_posts')
    .update({ caption, location: location || null })
    .eq('id', postId);
  if (error) throw error;
  await supabase.from('petlog_post_images').delete().eq('post_id', postId);
  await saveImages(postId, imageUrls);
  await supabase.from('petlog_post_hashtags').delete().eq('post_id', postId);
  await saveHashtags(postId, tagNames);
}

/** 게시물 삭제 (이미지 · 댓글 · 좋아요는 CASCADE 삭제) */
export async function deletePost(postId) {
  const { error } = await supabase.from('petlog_posts').delete().eq('id', postId);
  if (error) throw error;
}

/** 해시태그 자동완성 검색 */
export async function searchHashtags(prefix) {
  if (!prefix) return [];
  const { data } = await supabase
    .from('petlog_hashtags')
    .select('tag_name')
    .ilike('tag_name', `${prefix}%`)
    .limit(5);
  return (data ?? []).map((t) => t.tag_name);
}
