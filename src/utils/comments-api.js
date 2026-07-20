import { supabase } from '../lib/supabase';

/**
 * 댓글 · 답글 · 이모지 반응 관련 Supabase API 유틸리티
 */

/** 게시물의 댓글 전체 조회 (작성 펫 · 이모지 반응 포함, 오래된 순) */
export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('petlog_comments')
    .select(`
      *,
      pet:petlog_pet_profiles (id, name, profile_image_url, user_id),
      reactions:petlog_comment_reactions (id, emoji, pet_id)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** 댓글 / 답글 작성 (comments_count 는 DB 트리거가 자동 갱신) */
export async function addComment({ postId, petId, content, parentCommentId = null }) {
  const { error } = await supabase.from('petlog_comments').insert({
    post_id: postId,
    pet_id: petId,
    content,
    parent_comment_id: parentCommentId,
  });
  if (error) throw error;
}

/** 댓글 삭제 (답글은 CASCADE 삭제) */
export async function deleteComment(commentId) {
  const { error } = await supabase.from('petlog_comments').delete().eq('id', commentId);
  if (error) throw error;
}

/** 댓글 이모지 반응 토글 */
export async function toggleReaction(commentId, petId, emoji, isActive) {
  if (isActive) {
    const { error } = await supabase
      .from('petlog_comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('pet_id', petId)
      .eq('emoji', emoji);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('petlog_comment_reactions')
      .insert({ comment_id: commentId, pet_id: petId, emoji });
    if (error && error.code !== '23505') throw error;
  }
}
