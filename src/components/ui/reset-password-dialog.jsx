import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { supabase } from '../../lib/supabase';

/**
 * ResetPasswordDialog 컴포넌트 — 비밀번호 재설정 이메일 발송 다이얼로그
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 *
 * Example usage:
 * <ResetPasswordDialog isOpen={ isOpen } onClose={ () => setIsOpen(false) } />
 */
function ResetPasswordDialog({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleClose = () => {
    setEmail('');
    setIsSent(false);
    setError('');
    onClose();
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setError('가입한 이메일을 입력해주세요.');
      return;
    }
    setError('');
    setIsSending(true);
    /* 재설정 링크 클릭 시 앱으로 복귀 → PASSWORD_RECOVERY 이벤트로 재설정 화면 이동 */
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setIsSending(false);
    if (sendError) {
      setError('메일 발송에 실패했습니다. 이메일 주소를 확인해주세요.');
      return;
    }
    setIsSent(true);
  };

  return (
    <Dialog open={ isOpen } onClose={ handleClose } fullWidth maxWidth="xs">
      <DialogTitle sx={ { fontWeight: 900, fontSize: '1.05rem' } }>비밀번호 찾기</DialogTitle>
      <DialogContent sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
        { isSent ? (
          <Alert severity="success">
            재설정 메일을 보냈어요. 메일함에서 링크를 눌러 새 비밀번호를 설정해주세요.
          </Alert>
        ) : (
          <>
            <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary' } }>
              가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드려요.
            </Typography>
            <TextField
              label="이메일"
              type="email"
              value={ email }
              onChange={ (event) => setEmail(event.target.value) }
              fullWidth
              autoFocus
              autoComplete="email"
            />
            { error && <Alert severity="error">{ error }</Alert> }
          </>
        ) }
      </DialogContent>
      <DialogActions sx={ { px: 3, pb: 2 } }>
        <Button onClick={ handleClose }>{ isSent ? '확인' : '취소' }</Button>
        { !isSent && (
          <Button variant="contained" onClick={ handleSend } disabled={ isSending } sx={ { fontWeight: 700 } }>
            { isSending ? '발송 중...' : '재설정 메일 발송' }
          </Button>
        ) }
      </DialogActions>
    </Dialog>
  );
}

export default ResetPasswordDialog;
