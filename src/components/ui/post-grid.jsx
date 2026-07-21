import Box from '@mui/material/Box';
import CollectionsIcon from '@mui/icons-material/Collections';
import { useNavigate } from 'react-router-dom';

/**
 * PostGrid 컴포넌트 — 게시물 3열 정사각형 그리드 (클릭 시 상세로 이동)
 *
 * Props:
 * @param {Array} posts - 게시물 목록 (images 포함) [Required]
 * @param {boolean} hasEmphasis - 첫 칸을 2배 크기로 강조할지 여부 [Optional, 기본값: true]
 *
 * Example usage:
 * <PostGrid posts={ posts } />
 */
function PostGrid({ posts, hasEmphasis = true }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={ {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2px',
        p: '2px',
      } }
    >
      { posts.map((post, index) => (
        <Box
          key={ post.id }
          onClick={ () => navigate(`/post/${post.id}`) }
          sx={ {
            position: 'relative',
            aspectRatio: '1 / 1',
            cursor: 'pointer',
            overflow: 'hidden',
            /* 그리드 첫 칸은 2배 크기로 인기 게시물 강조 */
            ...(hasEmphasis && index === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
          } }
        >
          <Box
            component="img"
            src={ post.images[0]?.image_url }
            alt={ post.caption ?? '게시물' }
            loading="lazy"
            sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block', bgcolor: 'action.hover' } }
          />
          { post.images.length > 1 && (
            <CollectionsIcon
              sx={ {
                position: 'absolute',
                top: 6,
                right: 6,
                fontSize: 18,
                color: '#fff',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
              } }
            />
          ) }
        </Box>
      )) }
    </Box>
  );
}

export default PostGrid;
