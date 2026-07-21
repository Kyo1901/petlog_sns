import { supabase } from '../lib/supabase';

/**
 * 건강 기록 관련 Supabase API 유틸리티 (2차 개발)
 * - 예방접종 / 건강검진 / 구충 기록 CRUD + D-7 리마인더 알림 생성
 */

export const RECORD_TYPES = ['예방접종', '건강검진', '구충'];

/** Date → 'yyyy-mm-dd' 문자열 */
function toDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** 특정 펫의 건강 기록 목록 (최근 날짜순) */
export async function fetchHealthRecords(petId) {
  if (!petId) return [];
  const { data, error } = await supabase
    .from('petlog_health_records')
    .select('*')
    .eq('pet_id', petId)
    .order('record_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** 건강 기록 추가 */
export async function createHealthRecord({ petId, recordType, title, recordDate, nextDueDate, memo }) {
  const { error } = await supabase.from('petlog_health_records').insert({
    pet_id: petId,
    record_type: recordType,
    title,
    record_date: recordDate,
    next_due_date: nextDueDate || null,
    memo: memo || null,
  });
  if (error) throw error;
}

/** 건강 기록 수정 */
export async function updateHealthRecord({ recordId, recordType, title, recordDate, nextDueDate, memo }) {
  const { error } = await supabase
    .from('petlog_health_records')
    .update({
      record_type: recordType,
      title,
      record_date: recordDate,
      next_due_date: nextDueDate || null,
      memo: memo || null,
    })
    .eq('id', recordId);
  if (error) throw error;
}

/** 건강 기록 삭제 (연결된 리마인더 알림도 CASCADE 삭제) */
export async function deleteHealthRecord(recordId) {
  const { error } = await supabase.from('petlog_health_records').delete().eq('id', recordId);
  if (error) throw error;
}

/**
 * D-7 리마인더 알림 생성
 * - 다음 예정일이 오늘~7일 이내인 기록 중 아직 알림이 없는 것만 생성
 */
export async function ensureHealthReminders(userId, petIds) {
  if (!userId || !petIds?.length) return;
  const today = new Date();
  const weekLater = new Date(today.getTime() + 7 * 86400000);
  const { data: due } = await supabase
    .from('petlog_health_records')
    .select('id')
    .in('pet_id', petIds)
    .gte('next_due_date', toDateString(today))
    .lte('next_due_date', toDateString(weekLater));
  const dueIds = (due ?? []).map((row) => row.id);
  if (!dueIds.length) return;
  const { data: existing } = await supabase
    .from('petlog_notifications')
    .select('health_record_id')
    .eq('user_id', userId)
    .eq('type', 'health_reminder')
    .in('health_record_id', dueIds);
  const existingIds = new Set((existing ?? []).map((row) => row.health_record_id));
  const rows = dueIds
    .filter((id) => !existingIds.has(id))
    .map((id) => ({ user_id: userId, type: 'health_reminder', health_record_id: id }));
  if (rows.length) {
    /* 동시 실행으로 중복이 생겨도 unique index 가 막아줌 — 오류는 무시 */
    await supabase.from('petlog_notifications').insert(rows);
  }
}
