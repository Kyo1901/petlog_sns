/**
 * 날짜 관련 유틸리티 함수 모음
 */

/** 상대 시간 표기 (방금 전 / n분 전 / n시간 전 / n일 전 / yyyy.mm.dd) */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/** 생년월일 → 만 나이 계산 */
export function calcAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** 다음 생일까지 남은 일수 (생일 당일이면 0) */
export function daysUntilBirthday(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birth = new Date(birthDate);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) {
    next.setFullYear(next.getFullYear() + 1);
  }
  return Math.round((next - today) / 86400000);
}
