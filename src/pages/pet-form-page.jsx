import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import PetForm from '../components/ui/pet-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';

/**
 * PetFormPage 컴포넌트 — 펫 프로필 추가 · 편집
 *
 * Props: 없음 (URL 파라미터 petId 있으면 편집 모드)
 *
 * Example usage:
 * <Route path="/pets/new" element={ <PetFormPage /> } />
 */
function PetFormPage() {
  const { petId } = useParams();
  const isEdit = Boolean(petId);
  const navigate = useNavigate();
  const { user, pets, refreshPets, setActivePetId } = useAuth();
  const pet = isEdit ? pets.find((p) => p.id === Number(petId)) : null;

  if (isEdit && !pet) return <Navigate to="/profile" replace />;

  /** 펫 프로필 저장 (추가 또는 수정) */
  const handleSubmit = async (values) => {
    if (isEdit) {
      const { error } = await supabase
        .from('petlog_pet_profiles')
        .update(values)
        .eq('id', pet.id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('petlog_pet_profiles')
        .insert({ ...values, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setActivePetId(data.id);
    }
    await refreshPets();
    navigate('/profile', { replace: true });
  };

  return (
    <Box sx={ { pb: 6 } }>
      <AppHeader title={ isEdit ? '펫 프로필 편집' : '펫 프로필 추가' } hasBack />
      <Container maxWidth="sm" sx={ { px: { xs: 3, md: 3 }, py: { xs: 2, md: 4 } } }>
        <PetForm
          initialPet={ pet }
          onSubmit={ handleSubmit }
          submitLabel={ isEdit ? '수정하기' : '추가하기' }
        />
      </Container>
    </Box>
  );
}

export default PetFormPage;
