import Avatar from '@mui/material/Avatar';
import PetsIcon from '@mui/icons-material/Pets';

/**
 * PetAvatar 컴포넌트 — 펫 프로필 원형 아바타
 *
 * Props:
 * @param {object} pet - 펫 프로필 객체 (name, profile_image_url) [Required]
 * @param {number} size - 아바타 지름(px) [Optional, 기본값: 40]
 *
 * Example usage:
 * <PetAvatar pet={ pet } size={ 32 } />
 */
function PetAvatar({ pet, size = 40 }) {
  return (
    <Avatar
      src={ pet?.profile_image_url || undefined }
      alt={ pet?.name ?? '펫' }
      sx={ { width: size, height: size, bgcolor: 'primary.main', color: 'primary.contrastText' } }
    >
      <PetsIcon sx={ { fontSize: size * 0.55 } } />
    </Avatar>
  );
}

export default PetAvatar;
