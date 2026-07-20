import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { supabase } from '../lib/supabase';
import { calcAge } from '../utils/format-date';

/**
 * SignupPage 컴포넌트 — 이메일 회원가입 (닉네임 · 생년월일 · 만 14세 미만 차단)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/signup" element={ <SignupPage /> } />
 */
function SignupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  /** 입력값 검증 — 실패 시 오류 메시지 반환 */
  const validate = () => {
    if (values.password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (values.password !== values.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    if (!values.nickname.trim()) return '닉네임을 입력해주세요.';
    if (!values.birthDate) return '생년월일을 입력해주세요.';
    if (calcAge(values.birthDate) < 14) return '만 14세 미만은 가입할 수 없습니다.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      /* 닉네임 중복 확인 */
      const { data: existing } = await supabase
        .from('petlog_users')
        .select('id')
        .eq('nickname', values.nickname.trim())
        .maybeSingle();
      if (existing) {
        setError('이미 사용 중인 닉네임입니다.');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            nickname: values.nickname.trim(),
            birth_date: values.birthDate,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message.includes('already registered')
          ? '이미 가입된 이메일입니다.'
          : `가입 중 오류가 발생했습니다: ${signUpError.message}`);
        return;
      }
      if (data.session) {
        /* 즉시 로그인됨 → 펫 프로필 온보딩으로 이동 */
        navigate('/onboarding', { replace: true });
      } else {
        /* 이메일 인증이 필요한 경우 */
        setNotice('가입 확인 이메일을 보냈습니다. 메일함에서 인증 후 로그인해주세요.');
      }
    } finally {
      setIsSubmitting(false);
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
        <Box sx={ { textAlign: 'center', mb: 4 } }>
          <Typography sx={ { fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 900 } }>
            회원가입
          </Typography>
          <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary', mt: 0.5 } }>
            보호자 계정을 만들고 반려동물 프로필을 등록해보세요
          </Typography>
        </Box>

        { notice ? (
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            <Alert severity="success">{ notice }</Alert>
            <Button variant="contained" size="large" onClick={ () => navigate('/login') } sx={ { py: 1.5, fontWeight: 700 } }>
              로그인 화면으로
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={ handleSubmit } sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            <TextField
              label="이메일"
              type="email"
              value={ values.email }
              onChange={ handleChange('email') }
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="비밀번호 (6자 이상)"
              type="password"
              value={ values.password }
              onChange={ handleChange('password') }
              required
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="비밀번호 확인"
              type="password"
              value={ values.passwordConfirm }
              onChange={ handleChange('passwordConfirm') }
              required
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="닉네임 (보호자 이름)"
              value={ values.nickname }
              onChange={ handleChange('nickname') }
              required
              fullWidth
            />
            <TextField
              label="생년월일"
              type="date"
              value={ values.birthDate }
              onChange={ handleChange('birthDate') }
              required
              fullWidth
              slotProps={ { inputLabel: { shrink: true } } }
              helperText="만 14세 미만은 가입할 수 없습니다"
            />
            { error && <Alert severity="error">{ error }</Alert> }
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={ isSubmitting }
              sx={ { py: 1.5, fontWeight: 700 } }
            >
              { isSubmitting ? '가입 중...' : '가입하기' }
            </Button>
          </Box>
        ) }

        <Typography sx={ { textAlign: 'center', fontSize: '0.85rem', color: 'text.secondary', mt: 3 } }>
          이미 계정이 있나요?{ ' ' }
          <Link component={ RouterLink } to="/login" sx={ { fontWeight: 700 } }>
            로그인
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default SignupPage;
