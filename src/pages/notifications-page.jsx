import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';
import NotificationItem from '../components/ui/notification-item';
import { useAuth } from '../hooks/use-auth';
import { useNotifications } from '../hooks/use-notifications';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../utils/notifications-api';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'activity', label: '활동' },
  { key: 'reminder', label: '리마인더' },
];

/**
 * NotificationsPage 컴포넌트 — 알림 목록 (2차 개발)
 * - 유형별 필터(전체/활동/리마인더), 읽음 처리, 일괄 읽음, 스와이프 삭제
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/notifications" element={ <NotificationsPage /> } />
 */
function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUnread } = useNotifications();
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rows = await fetchNotifications({ userId: user.id, filter: FILTERS[tab].key });
      setNotifications(rows);
    } finally {
      setIsLoading(false);
    }
  }, [user, tab]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /** 알림 클릭 — 읽음 처리 후 관련 화면으로 이동 */
  const handleOpen = async (notification) => {
    if (!notification.is_read) {
      setNotifications((prev) => prev.map((n) => (
        n.id === notification.id ? { ...n, is_read: true } : n
      )));
      try {
        await markNotificationRead(notification.id);
        refreshUnread();
      } catch {
        /* 읽음 처리 실패는 무시 */
      }
    }
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    } else if (notification.type === 'follow' && notification.actor_pet) {
      navigate(`/pet/${notification.actor_pet.id}`);
    } else if (notification.type === 'health_reminder') {
      navigate('/profile?tab=health');
    }
  };

  /** 스와이프 삭제 */
  const handleDelete = async (notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    try {
      await deleteNotification(notification.id);
      refreshUnread();
    } catch {
      loadNotifications();
    }
  };

  /** 일괄 읽음 처리 */
  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(user.id);
      refreshUnread();
    } catch {
      loadNotifications();
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <Box>
      <AppHeader title="알림">
        { hasUnread && (
          <Button size="small" startIcon={ <DoneAllIcon /> } onClick={ handleReadAll } sx={ { fontWeight: 700 } }>
            모두 읽음
          </Button>
        ) }
      </AppHeader>

      <Tabs
        value={ tab }
        onChange={ (event, next) => setTab(next) }
        variant="fullWidth"
        sx={ { borderBottom: 1, borderColor: 'divider', minHeight: 44 } }
      >
        { FILTERS.map((filter) => (
          <Tab key={ filter.key } label={ filter.label } sx={ { fontWeight: 700, minHeight: 44 } } />
        )) }
      </Tabs>

      { isLoading ? (
        <Box sx={ { display: 'flex', justifyContent: 'center', py: 6 } }>
          <CircularProgress size={ 28 } />
        </Box>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={ <NotificationsNoneIcon /> }
          title="아직 알림이 없어요"
          description={ tab === 2
            ? '건강 기록에 다음 예정일을 등록하면\nD-7 리마인더가 여기에 표시됩니다'
            : '좋아요 · 댓글 · 팔로우 소식이 생기면\n여기에 표시됩니다' }
        />
      ) : (
        <Box>
          { notifications.map((notification) => (
            <NotificationItem
              key={ notification.id }
              notification={ notification }
              onClick={ handleOpen }
              onDelete={ handleDelete }
            />
          )) }
        </Box>
      ) }
    </Box>
  );
}

export default NotificationsPage;
