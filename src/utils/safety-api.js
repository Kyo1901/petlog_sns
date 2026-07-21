import { supabase } from '../lib/supabase';

/**
 * 신고 · 차단 관련 Supabase API 유틸리티 (2차 개발)
 * - 신고: 게시물/댓글 접수 → 관리자 검토 (동물 학대 의심은 최우선)
 * - 차단: 보호자 계정 단위 — 차단한 상대의 게시물·댓글·검색 노출 제외
 */

export const REPORT_REASONS = ['스팸', '동물 학대 의심', '욕설·혐오', '부적절한 콘텐츠', '기타'];

/** 게시물 · 댓글 신고 접수 */
export async function reportTarget({ reporterUserId, targetType, targetId, reason }) {
  const { error } = await supabase.from('petlog_reports').insert({
    reporter_user_id: reporterUserId,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) throw error;
}

/** 내 차단 목록 (차단 상대의 닉네임 포함) */
export async function fetchBlockedUsers(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('petlog_blocks')
    .select('id, blocked_user_id, created_at, blocked:petlog_users!blocked_user_id (id, nickname)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** 사용자 차단 */
export async function blockUser(userId, blockedUserId) {
  const { error } = await supabase
    .from('petlog_blocks')
    .insert({ user_id: userId, blocked_user_id: blockedUserId });
  if (error && error.code !== '23505') throw error;
}

/** 차단 해제 */
export async function unblockUser(userId, blockedUserId) {
  const { error } = await supabase
    .from('petlog_blocks')
    .delete()
    .eq('user_id', userId)
    .eq('blocked_user_id', blockedUserId);
  if (error) throw error;
}
