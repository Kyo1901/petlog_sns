import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EmptyState from './empty-state';
import PostGrid from './post-grid';
import { fetchCollections, fetchSavedPosts } from '../../utils/saved-api';

/**
 * SavedPostsTab 컴포넌트 — 마이페이지 저장한 게시물 탭
 * - 컬렉션 필터 칩(전체/미분류/컬렉션별) + 3열 그리드
 *
 * Props:
 * @param {string} userId - 보호자 계정 id [Required]
 *
 * Example usage:
 * <SavedPostsTab userId={ user.id } />
 */
function SavedPostsTab({ userId }) {
  const [collections, setCollections] = useState([]);
  /* undefined = 전체, null = 미분류, 숫자 = 해당 컬렉션 */
  const [selected, setSelected] = useState(undefined);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollections(userId).then(setCollections).catch(() => setCollections([]));
  }, [userId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setPosts(await fetchSavedPosts({ userId, collectionId: selected }));
    } finally {
      setIsLoading(false);
    }
  }, [userId, selected]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = [
    { key: 'all', label: '전체', value: undefined },
    { key: 'none', label: '미분류', value: null },
    ...collections.map((c) => ({ key: `c${c.id}`, label: c.name, value: c.id })),
  ];

  return (
    <Box>
      <Box sx={ { display: 'flex', gap: 1, px: 2, py: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } } }>
        { filters.map((filter) => {
          const isActive = filter.value === selected;
          return (
            <Chip
              key={ filter.key }
              label={ filter.label }
              clickable
              color={ isActive ? 'primary' : 'default' }
              variant={ isActive ? 'filled' : 'outlined' }
              onClick={ () => setSelected(filter.value) }
              sx={ { fontWeight: 700, flexShrink: 0 } }
            />
          );
        }) }
      </Box>

      { isLoading ? (
        <Box sx={ { display: 'flex', justifyContent: 'center', py: 5 } }>
          <CircularProgress size={ 28 } />
        </Box>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={ <BookmarkBorderIcon /> }
          title="저장한 게시물이 없어요"
          description={ '마음에 드는 게시물의 북마크를 눌러\n나만의 컬렉션을 만들어보세요' }
        />
      ) : (
        <PostGrid posts={ posts } hasEmphasis={ false } />
      ) }
    </Box>
  );
}

export default SavedPostsTab;
