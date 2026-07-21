import { supabase } from '../lib/supabase';

/**
 * 알림 관련 Supabase API 유틸리티 (2차 개발)
 * - 활동 알림(좋아요·댓글·팔로우)은 DB 트리거가 자동 생성
 * - 건강 리마인더 알림은 health-api 에서 생성
 */

const NOTI_SELECT = `
  *,
  actor_pet:petlog_pet_profiles (id, name, species, profile_image_url),
  post:petlog_posts (id, images:petlog_post_images (image_url, sort_order)),
  health_record:petlog_health_records (id, title, record_type, next_due_date)
`;

const ACTIVITY_TYPES = ['like', 'comment', 'follow'];

/** 조회 결과를 화면에서 쓰기 좋은 형태로 정리 (게시물 대표 썸네일 평탄화) */
function normalizeNotification(row) {
  const images = [...(row.post?.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return { ...row, post_thumbnail: images[0]?.image_url ?? null };
}

/** 알림 목록 조회 (filter: 'all' | 'activity' | 'reminder') */
export async function fetchNotifications({ userId, filter = 'all', limit = 100 }) {
  if (!userId) return [];
  let query = supabase
    .from('petlog_notifications')
    .select(NOTI_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (filter === 'activity') query = query.in('type', ACTIVITY_TYPES);
  if (filter === 'reminder') query = query.eq('type', 'health_reminder');
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeNotification);
}

/** 안 읽은 알림 수 (탭바 뱃지용) */
export async function fetchUnreadCount(userId) {
  if (!userId) return 0;
  const { count } = await supabase
    .from('petlog_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count ?? 0;
}

/** 알림 1건 읽음 처리 */
export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('petlog_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

/** 알림 일괄 읽음 처리 */
export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('petlog_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

/** 알림 삭제 (좌우 스와이프 삭제) */
export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('petlog_notifications')
    .delete()
    .eq('id', notificationId);
  if (error) throw error;
}
