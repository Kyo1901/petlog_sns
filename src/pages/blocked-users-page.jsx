import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import BlockIcon from '@mui/icons-material/Block';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';
import { useAuth } from '../hooks/use-auth';
import { useBlocks } from '../hooks/use-blocks';
import { fetchBlockedUsers, unblockUser } from '../utils/safety-api';
import { formatRelativeTime } from '../utils/format-date';

/**
 * BlockedUsersPage 컴포넌트 — 설정 > 차단 목록 관리
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/settings/blocks" element={ <BlockedUsersPage /> } />
 */
function BlockedUsersPage() {
  const { user } = useAuth();
  const { refreshBlocks } = useBlocks();
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      setBlocks(await fetchBlockedUsers(user.id));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  /** 차단 해제 */
  const handleUnblock = async (block) => {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
    try {
      await unblockUser(user.id, block.blocked_user_id);
      refreshBlocks();
    } catch {
      load();
    }
  };

  return (
    <Box>
      <AppHeader title="차단 목록" hasBack />

      { isLoading ? (
        <Box sx={ { display: 'flex', justifyContent: 'center', py: 6 } }>
          <CircularProgress size={ 28 } />
        </Box>
      ) : blocks.length === 0 ? (
        <EmptyState
          icon={ <BlockIcon /> }
          title="차단한 사용자가 없어요"
          description={ '게시물 더보기 메뉴에서 차단하면\n상대의 게시물 · 댓글이 보이지 않아요' }
        />
      ) : (
        <List disablePadding>
          { blocks.map((block) => (
            <ListItem
              key={ block.id }
              sx={ { px: 2, minHeight: 64 } }
              secondaryAction={ (
                <Button variant="outlined" size="small" onClick={ () => handleUnblock(block) } sx={ { fontWeight: 700 } }>
                  차단 해제
                </Button>
              ) }
            >
              <ListItemText
                primary={ block.blocked?.nickname ?? '알 수 없음' }
                secondary={ `차단일 · ${formatRelativeTime(block.created_at)}` }
                slotProps={ {
                  primary: { sx: { fontSize: '0.9rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.75rem' } },
                } }
              />
            </ListItem>
          )) }
        </List>
      ) }
    </Box>
  );
}

export default BlockedUsersPage;
