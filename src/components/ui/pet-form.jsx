import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import PetAvatar from '../common/pet-avatar';

const SPECIES_OPTIONS = ['강아지', '고양이', '소동물', '기타'];
const GENDER_OPTIONS = ['남아', '여아', '모름'];

/**
 * PetForm 컴포넌트 — 펫 프로필 등록/수정 공용 폼
 *
 * Props:
 * @param {object} initialPet - 수정 시 기존 펫 프로필 값 [Optional]
 * @param {function} onSubmit - 저장 시 실행할 함수 (values 전달, async 가능) [Required]
 * @param {string} submitLabel - 저장 버튼 문구 [Optional, 기본값: '저장하기']
 *
 * Example usage:
 * <PetForm onSubmit={ handleCreate } submitLabel="등록하기" />
 */
function PetForm({ initialPet, onSubmit, submitLabel = '저장하기' }) {
  const [values, setValues] = useState({
    name: initialPet?.name ?? '',
    species: initialPet?.species ?? '강아지',
    breed: initialPet?.breed ?? '',
    birth_date: initialPet?.birth_date ?? '',
    gender: initialPet?.gender ?? '모름',
    profile_image_url: initialPet?.profile_image_url ?? '',
    bio: initialPet?.bio ?? '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('반려동물 이름을 입력해주세요.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        breed: values.breed.trim() || null,
        birth_date: values.birth_date || null,
        profile_image_url: values.profile_image_url.trim() || null,
        bio: values.bio.trim() || null,
      });
    } catch (submitError) {
      setError(submitError.message ?? '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
      <Box sx={ { display: 'flex', justifyContent: 'center', py: 1 } }>
        <PetAvatar pet={ { name: values.name, profile_image_url: values.profile_image_url } } size={ 88 } />
      </Box>
      <TextField label="이름" value={ values.name } onChange={ handleChange('name') } required fullWidth />
      <TextField label="동물 종류" value={ values.species } onChange={ handleChange('species') } select fullWidth>
        { SPECIES_OPTIONS.map((option) => (
          <MenuItem key={ option } value={ option }>{ option }</MenuItem>
        )) }
      </TextField>
      <TextField label="품종" value={ values.breed } onChange={ handleChange('breed') } placeholder="예: 말티즈, 코리안숏헤어" fullWidth />
      <TextField
        label="생년월일"
        type="date"
        value={ values.birth_date }
        onChange={ handleChange('birth_date') }
        slotProps={ { inputLabel: { shrink: true } } }
        fullWidth
      />
      <TextField label="성별" value={ values.gender } onChange={ handleChange('gender') } select fullWidth>
        { GENDER_OPTIONS.map((option) => (
          <MenuItem key={ option } value={ option }>{ option }</MenuItem>
        )) }
      </TextField>
      <TextField
        label="프로필 사진 URL"
        value={ values.profile_image_url }
        onChange={ handleChange('profile_image_url') }
        placeholder="https://..."
        fullWidth
      />
      <TextField
        label="소개글"
        value={ values.bio }
        onChange={ handleChange('bio') }
        multiline
        rows={ 3 }
        placeholder="우리 아이를 소개해주세요"
        fullWidth
      />
      { error && (
        <Box sx={ { color: 'error.main', fontSize: '0.85rem' } }>{ error }</Box>
      ) }
      <Button type="submit" variant="contained" size="large" disabled={ isSaving } sx={ { py: 1.5, fontWeight: 700 } }>
        { isSaving ? '저장 중...' : submitLabel }
      </Button>
    </Box>
  );
}

export default PetForm;
