import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PetsIcon from '@mui/icons-material/Pets';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import EmptyState from '../components/ui/empty-state';
import PostCard from '../components/ui/post-card';
import { useAuth } from '../hooks/use-auth';
import {
  fetchFollowingIds,
  fetchLikedPostIds,
  fetchPosts,
  setLike,
} from '../utils/posts-api';

const PAGE_SIZE = 10;

/**
 * HomePage 컴포넌트 — 메인 피드 (팔로잉 / 추천 탭 + 무한 스크롤)
 * ※ 추천 탭 알고리즘은 3차 개발 — 그 전까지 전체 최신 게시물 표시
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/" element={ <HomePage /> } />
 */
function HomePage() {
  const navigate = useNavigate();
  const { activePet } = useAuth();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const sentinelRef = useRef(null);

  /** 페이지 단위 게시물 로드 (tab 0: 팔로잉+내 펫, tab 1: 전체 최신) */
  const loadPage = useCallback(async (targetPage, isReset) => {
    if (!activePet) return;
    setIsLoading(true);
    try {
      let followingPetIds = null;
      if (tab === 0) {
        const ids = await fetchFollowingIds(activePet.id);
        followingPetIds = [...ids, activePet.id];
      }
      const rows = await fetchPosts({ followingPetIds, page: targetPage, pageSize: PAGE_SIZE });
      const liked = await fetchLikedPostIds(activePet.id, rows.map((p) => p.id));
      setPosts((prev) => (isReset ? rows : [...prev, ...rows]));
      setLikedIds((prev) => (isReset ? liked : new Set([...prev, ...liked])));
      setHasMore(rows.length === PAGE_SIZE);
      setPage(targetPage);
    } finally {
      setIsLoading(false);
    }
  }, [activePet, tab]);

  /* 탭 변경 · 펫 변경 시 피드 초기화 */
  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    loadPage(0, true);
  }, [loadPage]);

  /* 무한 스크롤 — 하단 센티널 감지 */
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

  /** 좋아요 토글 — 낙관적 업데이트 후 서버 반영 */
  const handleToggleLike = async (post) => {
    if (!activePet) return;
    const isLiked = likedIds.has(post.id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
    setPosts((prev) => prev.map((p) => (
      p.id === post.id ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p
    )));
    try {
      await setLike(post.id, activePet.id, !isLiked);
    } catch {
      /* 실패 시 원복 */
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
      setPosts((prev) => prev.map((p) => (
        p.id === post.id ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p
      )));
    }
  };

  return (
    <Box>
      <AppHeader />
      <Tabs
        value={ tab }
        onChange={ (event, next) => setTab(next) }
        variant="fullWidth"
        sx={ { borderBottom: 1, borderColor: 'divider', minHeight: 44 } }
      >
        <Tab label="팔로잉" sx={ { fontWeight: 700, minHeight: 44 } } />
        <Tab label="추천" sx={ { fontWeight: 700, minHeight: 44 } } />
      </Tabs>

      { posts.map((post) => (
        <PostCard
          key={ post.id }
          post={ post }
          isLiked={ likedIds.has(post.id) }
          onToggleLike={ handleToggleLike }
        />
      )) }

      { !isLoading && posts.length === 0 && (
        tab === 0 ? (
          <EmptyState
            icon={ <PetsIcon /> }
            title="아직 피드가 비어있어요"
            description={ '다른 펫 친구를 팔로우하거나\n첫 게시물을 올려보세요!' }
            action={ (
              <Button variant="contained" onClick={ () => navigate('/explore') } sx={ { fontWeight: 700 } }>
                펫 친구 찾아보기
              </Button>
            ) }
          />
        ) : (
          <EmptyState
            icon={ <PetsIcon /> }
            title="아직 게시물이 없어요"
            description="첫 번째 게시물의 주인공이 되어보세요!"
          />
        )
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

export default HomePage;
