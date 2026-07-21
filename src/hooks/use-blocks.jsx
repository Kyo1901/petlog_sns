import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBlockedUsers } from '../utils/safety-api';
import { useAuth } from './use-auth';

/**
 * 차단한 사용자 id 전역 상태 훅
 * - 피드 · 탐색 · 댓글에서 차단 상대의 콘텐츠를 노출 제외할 때 사용
 */

const BlocksContext = createContext(null);

/**
 * BlocksProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 트리 [Required]
 *
 * Example usage:
 * <BlocksProvider><App /></BlocksProvider>
 */
export function BlocksProvider({ children }) {
  const { user } = useAuth();
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());

  const refreshBlocks = useCallback(async () => {
    if (!user) {
      setBlockedUserIds(new Set());
      return;
    }
    try {
      const rows = await fetchBlockedUsers(user.id);
      setBlockedUserIds(new Set(rows.map((row) => row.blocked_user_id)));
    } catch {
      /* 차단 목록 로드 실패는 무시 (다음 갱신에서 회복) */
    }
  }, [user]);

  useEffect(() => {
    refreshBlocks();
  }, [refreshBlocks]);

  const value = useMemo(() => ({ blockedUserIds, refreshBlocks }), [blockedUserIds, refreshBlocks]);

  return <BlocksContext.Provider value={ value }>{ children }</BlocksContext.Provider>;
}

/** 차단 컨텍스트 사용 훅 */
export function useBlocks() {
  return useContext(BlocksContext) ?? { blockedUserIds: new Set(), refreshBlocks: () => {} };
}
