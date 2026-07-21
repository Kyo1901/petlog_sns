import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';

/**
 * ResetPasswordPage 컴포넌트 — 새 비밀번호 설정 화면
 * (이메일의 재설정 링크로 진입 — PASSWORD_RECOVERY 세션 필요)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/reset-password" element={ <ResetPasswordPage /> } />
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!loading && !session) return <Navigate to="/login" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setError('비밀번호는 8자 이상으로 입력해주세요.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    setError('');
    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);
    if (updateError) {
      setError('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    setIsDone(true);
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
        <Typography sx={ { fontSize: '1.3rem', fontWeight: 900, mb: 1 } }>새 비밀번호 설정</Typography>
        <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary', mb: 3 } }>
          다시 사용할 새 비밀번호를 입력해주세요.
        </Typography>

        { isDone ? (
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            <Alert severity="success">비밀번호가 변경되었습니다.</Alert>
            <Button variant="contained" size="large" onClick={ () => navigate('/', { replace: true }) } sx={ { py: 1.5, fontWeight: 700 } }>
              홈으로 이동
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={ handleSubmit } sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            <TextField
              label="새 비밀번호"
              type="password"
              value={ password }
              onChange={ (event) => setPassword(event.target.value) }
              required
              fullWidth
              autoComplete="new-password"
              helperText="8자 이상 입력해주세요"
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              value={ confirm }
              onChange={ (event) => setConfirm(event.target.value) }
              required
              fullWidth
              autoComplete="new-password"
            />
            { error && <Alert severity="error">{ error }</Alert> }
            <Button type="submit" variant="contained" size="large" disabled={ isSaving } sx={ { py: 1.5, fontWeight: 700 } }>
              { isSaving ? '변경 중...' : '비밀번호 변경' }
            </Button>
          </Box>
        ) }
      </Container>
    </Box>
  );
}

export default ResetPasswordPage;
