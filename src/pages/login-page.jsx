import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';

/**
 * LoginPage 컴포넌트 — 이메일 로그인 화면
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/login" element={ <LoginPage /> } />
 */
function LoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <Box
      sx={ {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 2, md: 4 },
      } }
    >
      <Container maxWidth="sm" sx={ { px: { xs: 3, md: 3 } } }>
        <Box sx={ { textAlign: 'center', mb: 5 } }>
          <Typography
            sx={ {
              fontFamily: '"Syne", "Noto Sans KR", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '2.6rem', md: '3rem' },
              color: 'primary.main',
              letterSpacing: '-1px',
            } }
          >
            PetLog
          </Typography>
          <Typography sx={ { fontSize: '0.9rem', color: 'text.secondary', mt: 1 } }>
            반려동물과의 일상을 기록하고 공유하세요 🐾
          </Typography>
        </Box>

        <Box component="form" onSubmit={ handleSubmit } sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
          <TextField
            label="이메일"
            type="email"
            value={ email }
            onChange={ (event) => setEmail(event.target.value) }
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="비밀번호"
            type="password"
            value={ password }
            onChange={ (event) => setPassword(event.target.value) }
            required
            fullWidth
            autoComplete="current-password"
          />
          { error && <Alert severity="error">{ error }</Alert> }
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={ isSubmitting }
            sx={ { py: 1.5, fontWeight: 700 } }
          >
            { isSubmitting ? '로그인 중...' : '로그인' }
          </Button>
        </Box>

        <Typography sx={ { textAlign: 'center', fontSize: '0.85rem', color: 'text.secondary', mt: 3 } }>
          아직 계정이 없나요?{ ' ' }
          <Link component={ RouterLink } to="/signup" sx={ { fontWeight: 700 } }>
            회원가입
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default LoginPage;
