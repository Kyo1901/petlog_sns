import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import PetAvatar from '../common/pet-avatar';
import { setFollow } from '../../utils/posts-api';

/**
 * PetSuggestCard 컴포넌트 — 추천 펫 프로필 카드 (팔로우 버튼 포함)
 * - 카드 클릭 시 펫 프로필로 이동, 팔로우는 현재 선택된 펫 기준
 *
 * Props:
 * @param {object} pet - 추천 펫 프로필 객체 (id, name, species, breed, profile_image_url) [Required]
 * @param {number} followerPetId - 팔로우 주체가 될 내 활성 펫 id [Required]
 *
 * Example usage:
 * <PetSuggestCard pet={ pet } followerPetId={ activePet.id } />
 */
function PetSuggestCard({ pet, followerPetId }) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleToggleFollow = async (event) => {
    event.stopPropagation();
    if (!followerPetId) return;
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      await setFollow(followerPetId, pet.id, next);
    } catch {
      setIsFollowing(!next);
    }
  };

  return (
    <Paper
      variant="outlined"
      onClick={ () => navigate(`/pet/${pet.id}`) }
      sx={ {
        width: 128,
        flexShrink: 0,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.8,
        borderRadius: 3,
        cursor: 'pointer',
        textAlign: 'center',
      } }
    >
      <PetAvatar pet={ pet } size={ 56 } />
      <Box sx={ { minWidth: 0, width: '100%' } }>
        <Typography noWrap sx={ { fontSize: '0.85rem', fontWeight: 700 } }>
          { pet.name }
        </Typography>
        <Typography noWrap sx={ { fontSize: '0.7rem', color: 'text.secondary' } }>
          { pet.species }{ pet.breed ? ` · ${pet.breed}` : '' }
        </Typography>
      </Box>
      <Button
        size="small"
        variant={ isFollowing ? 'outlined' : 'contained' }
        onClick={ handleToggleFollow }
        disableElevation
        sx={ { borderRadius: 5, fontSize: '0.72rem', fontWeight: 700, px: 2, minHeight: 28 } }
      >
        { isFollowing ? '팔로잉' : '팔로우' }
      </Button>
    </Paper>
  );
}

export default PetSuggestCard;
