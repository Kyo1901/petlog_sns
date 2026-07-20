import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CollectionsIcon from '@mui/icons-material/Collections';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';
import { fetchPosts } from '../utils/posts-api';

const PAGE_SIZE = 21;

/**
 * ExplorePage 컴포넌트 — 탐색 (전체 최신 게시물 3열 그리드, 첫 칸 2배 강조)
 * ※ 검색 · 카테고리 필터 · 추천은 2차 개발 범위
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/explore" element={ <ExplorePage /> } />
 */
function ExplorePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (targetPage, isReset) => {
    setIsLoading(true);
    try {
      const rows = await fetchPosts({ page: targetPage, pageSize: PAGE_SIZE });
      setPosts((prev) => (isReset ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setPage(targetPage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(0, true);
  }, [loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadPage(page + 1, false);
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, page, loadPage]);

  return (
    <Box>
      <AppHeader title="탐색" />

      { !isLoading && posts.length === 0 ? (
        <EmptyState
          icon={ <SearchIcon /> }
          title="아직 게시물이 없어요"
          description="첫 번째 게시물을 올려보세요!"
        />
      ) : (
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
                ...(index === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
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
      ) }

      { isLoading && (
        <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
          <CircularProgress size={ 28 } />
        </Box>
      ) }
      <Box ref={ sentinelRef } sx={ { height: 4 } } />
    </Box>
  );
}

export default ExplorePage;
