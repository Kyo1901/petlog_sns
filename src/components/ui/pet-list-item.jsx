import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import PetAvatar from '../common/pet-avatar';

/**
 * PetListItem 컴포넌트 — 펫 검색 결과 한 줄 (클릭 시 펫 프로필로 이동)
 *
 * Props:
 * @param {object} pet - 펫 프로필 객체 (id, name, species, breed, profile_image_url, followers_count) [Required]
 *
 * Example usage:
 * <PetListItem pet={ pet } />
 */
function PetListItem({ pet }) {
  const navigate = useNavigate();

  return (
    <ListItemButton onClick={ () => navigate(`/pet/${pet.id}`) } sx={ { gap: 1.5, px: 2, minHeight: 64 } }>
      <PetAvatar pet={ pet } size={ 44 } />
      <ListItemText
        primary={ pet.name }
        secondary={ `${pet.species}${pet.breed ? ` · ${pet.breed}` : ''}` }
        slotProps={ {
          primary: { sx: { fontSize: '0.9rem', fontWeight: 700 } },
          secondary: { sx: { fontSize: '0.75rem' } },
        } }
      />
      <Typography sx={ { fontSize: '0.75rem', color: 'text.secondary', flexShrink: 0 } }>
        팔로워 { pet.followers_count ?? 0 }
      </Typography>
    </ListItemButton>
  );
}

export default PetListItem;
