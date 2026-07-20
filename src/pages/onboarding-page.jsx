import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import PetForm from '../components/ui/pet-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';

/**
 * OnboardingPage 컴포넌트 — 회원가입 직후 첫 펫 프로필 등록 화면
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/onboarding" element={ <OnboardingPage /> } />
 */
function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshPets, setActivePetId } = useAuth();

  /** 첫 펫 프로필 저장 후 홈으로 이동 */
  const handleSubmit = async (values) => {
    const { data, error } = await supabase
      .from('petlog_pet_profiles')
      .insert({ ...values, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await refreshPets();
    setActivePetId(data.id);
    navigate('/', { replace: true });
  };

  return (
    <Box sx={ { width: '100%', minHeight: '100vh', py: { xs: 4, md: 6 } } }>
      <Container maxWidth="sm" sx={ { px: { xs: 3, md: 3 } } }>
        <Box sx={ { textAlign: 'center', mb: 4 } }>
          <Typography sx={ { fontSize: '2.4rem' } }>🐾</Typography>
          <Typography sx={ { fontSize: { xs: '1.5rem', md: '1.8rem' }, fontWeight: 900 } }>
            반려동물을 소개해주세요
          </Typography>
          <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary', mt: 1 } }>
            PetLog의 주인공은 우리 아이!{ '\n' }피드 활동은 펫 프로필로 이루어져요
          </Typography>
        </Box>
        <PetForm onSubmit={ handleSubmit } submitLabel="등록하고 시작하기" />
      </Container>
    </Box>
  );
}

export default OnboardingPage;
