import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useNavigate } from 'react-router-dom';
import PetAvatar from '../common/pet-avatar';
import ImageSlider from './image-slider';
import { formatRelativeTime } from '../../utils/format-date';

/**
 * PostCard 컴포넌트 — 피드의 카드형 게시물 (더블탭 좋아요 + 하트 애니메이션)
 *
 * Props:
 * @param {object} post - 게시물 객체 (pet, images, hashtags 포함) [Required]
 * @param {boolean} isLiked - 현재 펫의 좋아요 여부 [Required]
 * @param {function} onToggleLike - 좋아요 토글 시 실행할 함수 (post 전달) [Required]
 *
 * Example usage:
 * <PostCard post={ post } isLiked={ liked } onToggleLike={ handleLike } />
 */
function PostCard({ post, isLiked, onToggleLike }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const isLongCaption = (post.caption ?? '').split('\n').length > 3 || (post.caption ?? '').length > 90;

  /** 더블탭 좋아요 — 하트 애니메이션 표시 후 좋아요 등록 */
  const handleDoubleTap = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
    if (!isLiked) onToggleLike(post);
  };

  /** 공유 — 게시물 링크 복사 + OS 공유 시트 호출 */
  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PetLog', url });
        return;
      } catch {
        /* 사용자가 공유 시트를 닫은 경우 무시 */
      }
    }
    await navigator.clipboard.writeText(url);
    setSnackOpen(true);
  };

  return (
    <Card elevation={ 0 } sx={ { borderBottom: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.default' } }>
      {/* 게시물 헤더 — 펫 프로필 */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 } }>
        <Box
          onClick={ () => navigate(`/pet/${post.pet.id}`) }
          sx={ { display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: 1, minWidth: 0 } }
        >
          <PetAvatar pet={ post.pet } size={ 40 } />
          <Box sx={ { minWidth: 0 } }>
            <Typography sx={ { fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3 } }>
              { post.pet.name }
            </Typography>
            <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary' } }>
              { post.pet.species }{ post.pet.breed ? ` · ${post.pet.breed}` : '' }
            </Typography>
          </Box>
        </Box>
        <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary', flexShrink: 0 } }>
          { formatRelativeTime(post.created_at) }
        </Typography>
      </Box>

      {/* 이미지 슬라이더 + 더블탭 하트 */}
      <Box sx={ { position: 'relative' } }>
        <ImageSlider
          images={ post.images }
          onClick={ () => navigate(`/post/${post.id}`) }
          onDoubleClick={ handleDoubleTap }
        />
        { showHeart && (
          <FavoriteIcon
            sx={ {
              position: 'absolute',
              top: '50%',
              left: '50%',
              fontSize: 96,
              color: '#fff',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              pointerEvents: 'none',
              animation: 'petlogHeart 0.8s ease forwards',
              '@keyframes petlogHeart': {
                '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
                '25%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 1 },
                '60%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                '100%': { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 },
              },
            } }
          />
        ) }
      </Box>

      {/* 액션 버튼 행 */}
      <Box sx={ { display: 'flex', alignItems: 'center', px: 1, pt: 0.5 } }>
        <IconButton
          onClick={ () => onToggleLike(post) }
          aria-label="좋아요"
          sx={ { width: 44, height: 44, color: isLiked ? 'error.main' : 'text.primary' } }
        >
          { isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon /> }
        </IconButton>
        <Typography sx={ { fontSize: '0.85rem', fontWeight: 700, mr: 1 } }>
          { post.likes_count }
        </Typography>
        <IconButton
          onClick={ () => navigate(`/post/${post.id}`) }
          aria-label="댓글"
          sx={ { width: 44, height: 44, color: 'text.primary' } }
        >
          <ChatBubbleOutlineIcon />
        </IconButton>
        <Typography sx={ { fontSize: '0.85rem', fontWeight: 700, mr: 1 } }>
          { post.comments_count }
        </Typography>
        <IconButton onClick={ handleShare } aria-label="공유" sx={ { width: 44, height: 44, color: 'text.primary' } }>
          <ShareOutlinedIcon />
        </IconButton>
      </Box>

      {/* 본문 · 해시태그 · 위치 */}
      <Box sx={ { px: 2, pb: 2 } }>
        { post.caption && (
          <>
            <Typography
              sx={ {
                fontSize: '0.88rem',
                whiteSpace: 'pre-line',
                ...(isExpanded ? {} : {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }),
              } }
            >
              { post.caption }
            </Typography>
            { isLongCaption && !isExpanded && (
              <Typography
                onClick={ () => setIsExpanded(true) }
                sx={ { fontSize: '0.8rem', color: 'text.secondary', cursor: 'pointer', mt: 0.5 } }
              >
                더 보기
              </Typography>
            ) }
          </>
        ) }
        { post.hashtags?.length > 0 && (
          <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 } }>
            { post.hashtags.map((tag) => (
              <Chip
                key={ tag.id }
                label={ `#${tag.tag_name}` }
                size="small"
                onClick={ () => navigate('/explore') }
                sx={ { fontSize: '0.72rem', bgcolor: 'action.hover', color: 'primary.main', fontWeight: 700 } }
              />
            )) }
          </Box>
        ) }
        { post.location && (
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.8, color: 'text.secondary' } }>
            <PlaceOutlinedIcon sx={ { fontSize: 14 } } />
            <Typography sx={ { fontSize: '0.72rem' } }>{ post.location }</Typography>
          </Box>
        ) }
      </Box>

      <Snackbar
        open={ snackOpen }
        autoHideDuration={ 2000 }
        onClose={ () => setSnackOpen(false) }
        message="게시물 링크가 복사되었습니다"
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
      />
    </Card>
  );
}

export default PostCard;
