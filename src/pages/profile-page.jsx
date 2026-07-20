import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CollectionsIcon from '@mui/icons-material/Collections';
import GridOnIcon from '@mui/icons-material/GridOn';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import PetAvatar from '../components/common/pet-avatar';
import EmptyState from '../components/ui/empty-state';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';
import { calcAge, daysUntilBirthday } from '../utils/format-date';
import {
  checkFollowing,
  fetchFollowCounts,
  fetchPostCount,
  fetchPosts,
  setFollow,
} from '../utils/posts-api';

/**
 * ProfilePage 컴포넌트 — 마이페이지(/profile) 및 펫 프로필(/pet/:petId)
 * - 내 프로필: 펫 전환 탭 + 펫 추가 + 프로필 편집 + 로그아웃
 * - 타 펫 프로필: 팔로우 / 언팔로우
 *
 * Props: 없음 (URL 파라미터 petId 사용)
 *
 * Example usage:
 * <Route path="/profile" element={ <ProfilePage /> } />
 */
function ProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user, profile, pets, activePet, setActivePetId, signOut } = useAuth();

  const targetPetId = petId ? Number(petId) : activePet?.id;
  const myPet = pets.find((p) => p.id === targetPetId) ?? null;

  const [pet, setPet] = useState(myPet);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMyPet = pet?.user_id === user?.id;

  const load = useCallback(async () => {
    if (!targetPetId) return;
    setIsLoading(true);
    try {
      let target = pets.find((p) => p.id === targetPetId) ?? null;
      if (!target) {
        const { data } = await supabase
          .from('petlog_pet_profiles')
          .select('*')
          .eq('id', targetPetId)
          .maybeSingle();
        target = data;
      }
      setPet(target);
      if (!target) return;
      const [postCount, followCounts, postRows] = await Promise.all([
        fetchPostCount(target.id),
        fetchFollowCounts(target.id),
        fetchPosts({ petId: target.id, pageSize: 30 }),
      ]);
      setStats({ posts: postCount, followers: followCounts.followers, following: followCounts.following });
      setPosts(postRows);
      if (target.user_id !== user?.id && activePet) {
        setIsFollowing(await checkFollowing(activePet.id, target.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetPetId, pets, user, activePet]);

  useEffect(() => {
    load();
  }, [load]);

  /** 팔로우 / 언팔로우 토글 */
  const handleToggleFollow = async () => {
    if (!activePet || !pet) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setStats((prev) => ({ ...prev, followers: prev.followers + (next ? 1 : -1) }));
    try {
      await setFollow(activePet.id, pet.id, next);
    } catch {
      setIsFollowing(!next);
      setStats((prev) => ({ ...prev, followers: prev.followers + (next ? -1 : 1) }));
    }
  };

  const birthdayDday = pet?.birth_date ? daysUntilBirthday(pet.birth_date) : null;
  const age = pet?.birth_date ? calcAge(pet.birth_date) : null;

  if (!pet && !isLoading) {
    return (
      <Box>
        <AppHeader title="프로필" hasBack={ Boolean(petId) } />
        <Typography sx={ { textAlign: 'center', py: 8, color: 'text.secondary' } }>
          펫 프로필을 찾을 수 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      { petId && !isMyPet ? (
        <AppHeader title={ pet?.name ?? '프로필' } hasBack />
      ) : (
        <AppHeader title="마이페이지">
          <IconButton onClick={ () => navigate('/pets/new') } aria-label="펫 추가" sx={ { color: 'text.primary' } }>
            <AddIcon />
          </IconButton>
          <IconButton onClick={ signOut } aria-label="로그아웃" sx={ { color: 'text.primary' } }>
            <LogoutIcon />
          </IconButton>
        </AppHeader>
      ) }

      {/* 내 펫이 여러 마리일 때 전환 탭 */}
      { isMyPet && !petId && pets.length > 1 && (
        <Tabs
          value={ pets.findIndex((p) => p.id === targetPetId) }
          onChange={ (event, index) => setActivePetId(pets[index].id) }
          variant="scrollable"
          scrollButtons="auto"
          sx={ { borderBottom: 1, borderColor: 'divider', minHeight: 42 } }
        >
          { pets.map((p) => (
            <Tab key={ p.id } label={ p.name } sx={ { fontWeight: 700, minHeight: 42 } } />
          )) }
        </Tabs>
      ) }

      { isLoading || !pet ? (
        <Box sx={ { display: 'flex', justifyContent: 'center', py: 8 } }>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* 펫 프로필 카드 */}
          <Box sx={ { px: 3, py: 3 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 3 } }>
              <PetAvatar pet={ pet } size={ 76 } />
              <Box sx={ { flexGrow: 1 } }>
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' } }>
                  <Typography sx={ { fontSize: '1.2rem', fontWeight: 900 } }>{ pet.name }</Typography>
                  { birthdayDday !== null && birthdayDday <= 30 && (
                    <Chip
                      label={ birthdayDday === 0 ? '🎂 오늘 생일!' : `🎂 생일 D-${birthdayDday}` }
                      size="small"
                      color="primary"
                      sx={ { fontSize: '0.7rem', fontWeight: 700 } }
                    />
                  ) }
                </Box>
                <Typography sx={ { fontSize: '0.8rem', color: 'text.secondary', mt: 0.3 } }>
                  { pet.species }
                  { pet.breed ? ` · ${pet.breed}` : '' }
                  { age !== null ? ` · ${age}살` : '' }
                  { pet.gender ? ` · ${pet.gender}` : '' }
                </Typography>
                { isMyPet && profile && (
                  <Typography sx={ { fontSize: '0.75rem', color: 'text.secondary', mt: 0.3 } }>
                    보호자 · { profile.nickname }
                  </Typography>
                ) }
              </Box>
            </Box>

            { pet.bio && (
              <Typography sx={ { fontSize: '0.85rem', mt: 2, whiteSpace: 'pre-line' } }>
                { pet.bio }
              </Typography>
            ) }

            {/* 통계 */}
            <Box sx={ { display: 'flex', justifyContent: 'space-around', mt: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'action.hover' } }>
              { [
                { label: '게시물', value: stats.posts },
                { label: '팔로워', value: stats.followers },
                { label: '팔로잉', value: stats.following },
              ].map((item) => (
                <Box key={ item.label } sx={ { textAlign: 'center' } }>
                  <Typography sx={ { fontSize: '1.05rem', fontWeight: 900 } }>{ item.value }</Typography>
                  <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary' } }>{ item.label }</Typography>
                </Box>
              )) }
            </Box>

            {/* 액션 버튼 */}
            <Box sx={ { display: 'flex', gap: 1, mt: 2 } }>
              { isMyPet ? (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={ () => navigate(`/pets/${pet.id}/edit`) }
                  sx={ { fontWeight: 700 } }
                >
                  프로필 편집
                </Button>
              ) : (
                <Button
                  variant={ isFollowing ? 'outlined' : 'contained' }
                  fullWidth
                  onClick={ handleToggleFollow }
                  disabled={ !activePet }
                  sx={ { fontWeight: 700 } }
                >
                  { isFollowing ? '팔로잉' : '팔로우' }
                </Button>
              ) }
            </Box>
          </Box>

          {/* 게시물 그리드 */}
          <Box sx={ { borderTop: 1, borderColor: 'divider' } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.7, px: 2, py: 1.2, color: 'text.secondary' } }>
              <GridOnIcon sx={ { fontSize: 16 } } />
              <Typography sx={ { fontSize: '0.8rem', fontWeight: 700 } }>게시물</Typography>
            </Box>
            { posts.length === 0 ? (
              <EmptyState
                icon={ <CollectionsIcon /> }
                title="아직 게시물이 없어요"
                description={ isMyPet ? '첫 게시물을 올려보세요!' : undefined }
              />
            ) : (
              <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', p: '2px' } }>
                { posts.map((post) => (
                  <Box
                    key={ post.id }
                    onClick={ () => navigate(`/post/${post.id}`) }
                    sx={ { position: 'relative', aspectRatio: '1 / 1', cursor: 'pointer', overflow: 'hidden' } }
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
                          fontSize: 16,
                          color: '#fff',
                          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                        } }
                      />
                    ) }
                  </Box>
                )) }
              </Box>
            ) }
          </Box>
        </>
      ) }
    </Box>
  );
}

export default ProfilePage;
