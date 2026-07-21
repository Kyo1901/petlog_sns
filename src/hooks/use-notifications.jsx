import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ensureHealthReminders } from '../utils/health-api';
import { fetchUnreadCount } from '../utils/notifications-api';
import { useAuth } from './use-auth';

/**
 * 안 읽은 알림 수 전역 상태 훅 (하단 탭바 뱃지 + 알림 페이지 공유)
 */

const NotificationsContext = createContext(null);

/**
 * NotificationsProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 트리 [Required]
 *
 * Example usage:
 * <NotificationsProvider><App /></NotificationsProvider>
 */
export function NotificationsProvider({ children }) {
  const { user, pets } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      setUnreadCount(await fetchUnreadCount(user.id));
    } catch {
      /* 뱃지 갱신 실패는 무시 (다음 갱신에서 회복) */
    }
  }, [user]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  /* 로그인 후 다음 예정일 D-7 이내 건강 기록에 대한 리마인더 알림 생성 */
  useEffect(() => {
    if (!user || pets.length === 0) return;
    ensureHealthReminders(user.id, pets.map((pet) => pet.id))
      .then(refreshUnread)
      .catch(() => {});
  }, [user, pets, refreshUnread]);

  const value = useMemo(() => ({ unreadCount, refreshUnread }), [unreadCount, refreshUnread]);

  return <NotificationsContext.Provider value={ value }>{ children }</NotificationsContext.Provider>;
}

/** 알림 컨텍스트 사용 훅 */
export function useNotifications() {
  return useContext(NotificationsContext) ?? { unreadCount: 0, refreshUnread: () => {} };
}
