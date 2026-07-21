import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import TagIcon from '@mui/icons-material/Tag';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';
import PetListItem from '../components/ui/pet-list-item';
import PetSuggestCard from '../components/ui/pet-suggest-card';
import PostGrid from '../components/ui/post-grid';
import SearchBar from '../components/ui/search-bar';
import { useAuth } from '../hooks/use-auth';
import { useBlocks } from '../hooks/use-blocks';
import {
  fetchPopularHashtags,
  fetchPostsBySpecies,
  fetchPostsByTag,
  fetchRecommendedPets,
  searchHashtagsByKeyword,
  searchPetsByName,
} from '../utils/explore-api';
import { fetchFollowingIds, fetchPosts } from '../utils/posts-api';

const PAGE_SIZE = 21;
const SPECIES_FILTERS = ['전체', '강아지', '고양이', '소동물', '기타'];

/**
 * SectionTitle 컴포넌트 — 탐색 페이지 섹션 제목
 *
 * Props:
 * @param {string} title - 섹션 제목 텍스트 [Required]
 *
 * Example usage:
 * <SectionTitle title="인기 해시태그" />
 */
function SectionTitle({ title }) {
  return (
    <Typography sx={ { fontSize: '0.85rem', fontWeight: 900, px: 2, pt: 2, pb: 1 } }>
      { title }
    </Typography>
  );
}

/**
 * ExplorePage 컴포넌트 — 탐색 · 검색 (2차 개발)
 * - 해시태그 · 펫 이름 검색 + 최근 검색어, 카테고리 필터, 인기 해시태그, 추천 펫
 * - 게시물 3열 그리드(첫 칸 2배 강조) + 무한 스크롤, ?tag= 파라미터로 태그 피드 진입
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/explore" element={ <ExplorePage /> } />
 */
function ExplorePage() {
  const { user, activePet } = useAuth();
  const { blockedUserIds } = useBlocks();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag');

  const [searchValue, setSearchValue] = useState(tagParam ? `#${tagParam}` : '');
  const [submittedKeyword, setSubmittedKeyword] = useState(null);
  const [category, setCategory] = useState('전체');

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const sentinelRef = useRef(null);

  const [popularTags, setPopularTags] = useState([]);
  const [recommendedPets, setRecommendedPets] = useState([]);

  const [petResults, setPetResults] = useState([]);
  const [tagResults, setTagResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  /* 그리드에 적용할 필터 — 태그 > 카테고리 > 전체 순 */
  const filter = useMemo(() => {
    if (tagParam) return { type: 'tag', value: tagParam };
    if (category !== '전체') return { type: 'species', value: category };
    return { type: 'all', value: null };
  }, [tagParam, category]);

  const loadPage = useCallback(async (targetPage, isReset) => {
    setIsLoading(true);
    try {
      let rows = [];
      if (filter.type === 'tag') {
        rows = await fetchPostsByTag(filter.value, { page: targetPage, pageSize: PAGE_SIZE });
      } else if (filter.type === 'species') {
        rows = await fetchPostsBySpecies(filter.value, { page: targetPage, pageSize: PAGE_SIZE });
      } else {
        rows = await fetchPosts({ page: targetPage, pageSize: PAGE_SIZE });
      }
      setPosts((prev) => (isReset ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setPage(targetPage);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  /* 필터가 바뀌면 그리드를 처음부터 다시 로드 */
  useEffect(() => {
    loadPage(0, true);
  }, [loadPage]);

  /* 무한 스크롤 sentinel */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading && !submittedKeyword) {
        loadPage(page + 1, false);
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, page, loadPage, submittedKeyword]);

  /* 인기 해시태그 로드 (최초 1회) */
  useEffect(() => {
    fetchPopularHashtags(10).then(setPopularTags).catch(() => setPopularTags([]));
  }, []);

  /* 추천 펫 로드 — 내 펫과 이미 팔로우 중인 펫 제외 */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const followingPetIds = await fetchFollowingIds(activePet?.id);
      const pets = await fetchRecommendedPets({ myUserId: user.id, followingPetIds, limit: 10 });
      setRecommendedPets(pets);
    };
    load().catch(() => setRecommendedPets([]));
  }, [user, activePet?.id]);

  /* 키워드 검색 실행 — 펫 이름 + 해시태그 동시 검색 */
  useEffect(() => {
    if (!submittedKeyword) return;
    let isStale = false;
    setIsSearchLoading(true);
    Promise.all([
      searchPetsByName(submittedKeyword),
      searchHashtagsByKeyword(submittedKeyword),
    ])
      .then(([pets, tags]) => {
        if (isStale) return;
        setPetResults(pets);
        setTagResults(tags);
      })
      .finally(() => {
        if (!isStale) setIsSearchLoading(false);
      });
    return () => {
      isStale = true;
    };
  }, [submittedKeyword]);

  const handleTagSelect = (tagName) => {
    setSubmittedKeyword(null);
    setSearchValue(`#${tagName}`);
    setSearchParams({ tag: tagName }, { replace: Boolean(tagParam) });
  };

  const handleSearchChange = (next) => {
    setSearchValue(next);
    /* 검색어를 모두 지우면 기본 탐색 화면으로 복귀 */
    if (next === '') {
      setSubmittedKeyword(null);
      if (tagParam) setSearchParams({}, { replace: true });
    }
  };

  const handleSearchSubmit = (keyword) => {
    if (keyword.startsWith('#')) {
      const tagName = keyword.replace(/^#/, '').trim();
      if (tagName) handleTagSelect(tagName);
      return;
    }
    setSearchValue(keyword);
    setSubmittedKeyword(keyword);
    if (tagParam) setSearchParams({}, { replace: true });
  };

  /* 차단한 사용자의 게시물 · 펫 프로필은 노출 제외 */
  const visiblePosts = posts.filter((post) => !blockedUserIds.has(post.pet?.user_id));
  const visiblePetResults = petResults.filter((pet) => !blockedUserIds.has(pet.user_id));
  const visibleRecommended = recommendedPets.filter((pet) => !blockedUserIds.has(pet.user_id));

  const isSearchResultEmpty = visiblePetResults.length === 0 && tagResults.length === 0;

  return (
    <Box>
      <AppHeader title="탐색" />

      {/* 스크롤 시 상단에 고정되는 검색창 */}
      <Box
        sx={ (theme) => ({
          position: 'sticky',
          top: 56,
          zIndex: theme.zIndex.appBar - 1,
          bgcolor: 'background.default',
          px: 2,
          py: 1.2,
          borderBottom: 1,
          borderColor: 'divider',
        }) }
      >
        <SearchBar value={ searchValue } onChange={ handleSearchChange } onSubmit={ handleSearchSubmit } />
      </Box>

      { submittedKeyword ? (
        /* ───── 검색 결과 (펫 + 해시태그) ───── */
        isSearchLoading ? (
          <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
            <CircularProgress size={ 28 } />
          </Box>
        ) : isSearchResultEmpty ? (
          <EmptyState
            icon={ <SearchOffIcon /> }
            title="검색 결과가 없어요"
            description={ `'${submittedKeyword}'와 일치하는\n펫이나 해시태그를 찾지 못했어요` }
          />
        ) : (
          <Box sx={ { pb: 2 } }>
            { visiblePetResults.length > 0 && (
              <>
                <SectionTitle title="펫" />
                <List disablePadding>
                  { visiblePetResults.map((pet) => (
                    <PetListItem key={ pet.id } pet={ pet } />
                  )) }
                </List>
              </>
            ) }
            { tagResults.length > 0 && (
              <>
                <SectionTitle title="해시태그" />
                <List disablePadding>
                  { tagResults.map((tag) => (
                    <ListItemButton key={ tag.id } onClick={ () => handleTagSelect(tag.tag_name) } sx={ { px: 2, minHeight: 56 } }>
                      <ListItemIcon sx={ { minWidth: 40 } }>
                        <TagIcon sx={ { color: 'primary.main' } } />
                      </ListItemIcon>
                      <ListItemText
                        primary={ `#${tag.tag_name}` }
                        secondary={ `게시물 ${tag.post_count}개` }
                        slotProps={ {
                          primary: { sx: { fontSize: '0.9rem', fontWeight: 700 } },
                          secondary: { sx: { fontSize: '0.75rem' } },
                        } }
                      />
                    </ListItemButton>
                  )) }
                </List>
              </>
            ) }
          </Box>
        )
      ) : (
        /* ───── 탐색 기본 화면 / 태그 피드 ───── */
        <>
          { tagParam ? (
            <Box sx={ { px: 2, pt: 2, pb: 1 } }>
              <Typography sx={ { fontSize: '1.05rem', fontWeight: 900, color: 'primary.main' } }>
                #{ tagParam }
              </Typography>
            </Box>
          ) : (
            <>
              {/* 카테고리 필터 */}
              <Box sx={ { display: 'flex', gap: 1, px: 2, pt: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } } }>
                { SPECIES_FILTERS.map((option) => (
                  <Chip
                    key={ option }
                    label={ option }
                    clickable
                    color={ category === option ? 'primary' : 'default' }
                    variant={ category === option ? 'filled' : 'outlined' }
                    onClick={ () => setCategory(option) }
                    sx={ { fontWeight: 700, flexShrink: 0 } }
                  />
                )) }
              </Box>

              {/* 인기 해시태그 */}
              { popularTags.length > 0 && (
                <>
                  <SectionTitle title="인기 해시태그" />
                  <Box sx={ { display: 'flex', gap: 1, px: 2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } } }>
                    { popularTags.map((tag) => (
                      <Chip
                        key={ tag.id }
                        label={ `#${tag.tag_name}` }
                        clickable
                        size="small"
                        onClick={ () => handleTagSelect(tag.tag_name) }
                        sx={ { fontWeight: 700, color: 'primary.main', bgcolor: 'action.hover', flexShrink: 0 } }
                      />
                    )) }
                  </Box>
                </>
              ) }

              {/* 팔로우할 만한 펫 프로필 추천 */}
              { visibleRecommended.length > 0 && (
                <>
                  <SectionTitle title="추천 펫 프로필" />
                  <Box sx={ { display: 'flex', gap: 1, px: 2, pb: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } } }>
                    { visibleRecommended.map((pet) => (
                      <PetSuggestCard key={ pet.id } pet={ pet } followerPetId={ activePet?.id } />
                    )) }
                  </Box>
                </>
              ) }

              <SectionTitle title={ category === '전체' ? '인기 게시물' : `${category} 게시물` } />
            </>
          ) }

          { !isLoading && visiblePosts.length === 0 ? (
            <EmptyState
              icon={ <SearchIcon /> }
              title="게시물이 없어요"
              description={ tagParam ? '이 해시태그가 달린 게시물이 아직 없어요' : '첫 번째 게시물을 올려보세요!' }
            />
          ) : (
            <PostGrid posts={ visiblePosts } hasEmphasis={ !tagParam } />
          ) }

          { isLoading && (
            <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
              <CircularProgress size={ 28 } />
            </Box>
          ) }
          <Box ref={ sentinelRef } sx={ { height: 4 } } />
        </>
      ) }
    </Box>
  );
}

export default ExplorePage;
