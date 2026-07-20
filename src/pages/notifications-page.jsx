import Box from '@mui/material/Box';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';

/**
 * NotificationsPage 컴포넌트 — 알림 (1차 개발: 빈 상태 화면만 표시)
 * ※ 좋아요 · 댓글 · 팔로우 알림 수집과 표시는 2차 개발 범위
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/notifications" element={ <NotificationsPage /> } />
 */
function NotificationsPage() {
  return (
    <Box>
      <AppHeader title="알림" />
      <EmptyState
        icon={ <NotificationsNoneIcon /> }
        title="아직 알림이 없어요"
        description={ '좋아요 · 댓글 · 팔로우 소식이 생기면\n여기에 표시됩니다' }
      />
    </Box>
  );
}

export default NotificationsPage;
