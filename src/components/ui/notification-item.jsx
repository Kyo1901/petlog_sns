import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PetAvatar from '../common/pet-avatar';
import { formatRelativeTime } from '../../utils/format-date';

const DELETE_THRESHOLD = 64;
const MAX_SWIPE = 96;

/* 알림 유형별 아이콘 · 색상 (건강 리마인더는 다른 색으로 구분) */
const TYPE_META = {
  like: { icon: FavoriteIcon, color: 'error.main' },
  comment: { icon: ChatBubbleIcon, color: 'primary.main' },
  follow: { icon: PersonAddAlt1Icon, color: 'primary.main' },
  health_reminder: { icon: HealthAndSafetyIcon, color: 'warning.main' },
};

/** 알림 유형별 안내 문구 생성 */
function buildMessage(notification) {
  const name = notification.actor_pet?.name ?? '알 수 없음';
  if (notification.type === 'like') return `${name}님이 게시물을 좋아해요`;
  if (notification.type === 'comment') return `${name}님이 게시물에 댓글을 남겼어요`;
  if (notification.type === 'follow') return `${name}님이 팔로우하기 시작했어요`;
  if (notification.health_record?.title) {
    return `'${notification.health_record.title}' 일정이 다가오고 있어요`;
  }
  return '건강 기록 일정이 다가오고 있어요';
}

/**
 * NotificationItem 컴포넌트 — 알림 한 줄 (좌로 스와이프하면 삭제)
 *
 * Props:
 * @param {object} notification - 알림 객체 (type, is_read, actor_pet, post_thumbnail 등) [Required]
 * @param {function} onClick - 알림 클릭 시 실행 (알림 객체 전달) [Required]
 * @param {function} onDelete - 스와이프 삭제 시 실행 (알림 객체 전달) [Required]
 *
 * Example usage:
 * <NotificationItem notification={ noti } onClick={ handleOpen } onDelete={ handleDelete } />
 */
function NotificationItem({ notification, onClick, onDelete }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const movedRef = useRef(false);

  const meta = TYPE_META[notification.type] ?? TYPE_META.like;
  const TypeIcon = meta.icon;

  const handleTouchStart = (event) => {
    startXRef.current = event.touches[0].clientX;
    movedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (event) => {
    if (startXRef.current === null) return;
    const delta = event.touches[0].clientX - startXRef.current;
    if (Math.abs(delta) > 6) movedRef.current = true;
    /* 왼쪽 스와이프만 허용 */
    setOffsetX(Math.max(Math.min(delta, 0), -MAX_SWIPE));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    startXRef.current = null;
    if (offsetX <= -DELETE_THRESHOLD) {
      onDelete(notification);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (movedRef.current) return;
    onClick(notification);
  };

  return (
    <Box sx={ { position: 'relative', overflow: 'hidden' } }>
      {/* 스와이프 시 뒤에 보이는 삭제 영역 */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 3,
          bgcolor: 'error.main',
          color: '#fff',
        } }
      >
        <DeleteIcon />
      </Box>

      <Box
        onTouchStart={ handleTouchStart }
        onTouchMove={ handleTouchMove }
        onTouchEnd={ handleTouchEnd }
        onClick={ handleClick }
        sx={ {
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          minHeight: 64,
          cursor: 'pointer',
          bgcolor: notification.is_read ? 'background.default' : 'action.hover',
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
          position: 'relative',
        } }
      >
        <Box sx={ { position: 'relative', flexShrink: 0 } }>
          { notification.type === 'health_reminder' ? (
            <Box
              sx={ {
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                color: meta.color,
              } }
            >
              <TypeIcon />
            </Box>
          ) : (
            <>
              <PetAvatar pet={ notification.actor_pet } size={ 44 } />
              <TypeIcon
                sx={ {
                  position: 'absolute',
                  right: -4,
                  bottom: -2,
                  fontSize: 16,
                  color: meta.color,
                  bgcolor: 'background.default',
                  borderRadius: '50%',
                  p: '1px',
                } }
              />
            </>
          ) }
        </Box>

        <Box sx={ { flexGrow: 1, minWidth: 0 } }>
          <Typography sx={ { fontSize: '0.85rem', fontWeight: notification.is_read ? 400 : 700 } }>
            { buildMessage(notification) }
          </Typography>
          <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary', mt: 0.3 } }>
            { formatRelativeTime(notification.created_at) }
          </Typography>
        </Box>

        { notification.post_thumbnail && (
          <Box
            component="img"
            src={ notification.post_thumbnail }
            alt="게시물"
            sx={ { width: 44, height: 44, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 } }
          />
        ) }
        { !notification.is_read && (
          <Box sx={ { width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 } } />
        ) }
      </Box>
    </Box>
  );
}

export default NotificationItem;
