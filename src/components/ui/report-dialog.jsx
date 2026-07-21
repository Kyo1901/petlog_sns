import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { REPORT_REASONS, reportTarget } from '../../utils/safety-api';

/**
 * ReportDialog 컴포넌트 — 게시물 · 댓글 신고 다이얼로그 (사유 선택)
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 * @param {string} userId - 신고자(보호자) 계정 id [Required]
 * @param {string} targetType - 신고 대상 종류 ('게시물' | '댓글') [Required]
 * @param {number} targetId - 신고 대상 id [Required]
 *
 * Example usage:
 * <ReportDialog isOpen={ isOpen } onClose={ close } userId={ user.id } targetType="게시물" targetId={ post.id } />
 */
function ReportDialog({ isOpen, onClose, userId, targetType, targetId }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setReason(REPORT_REASONS[0]);
    setIsDone(false);
    setError('');
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');
    setIsSending(true);
    try {
      await reportTarget({ reporterUserId: userId, targetType, targetId, reason });
      setIsDone(true);
    } catch {
      setError('신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={ isOpen } onClose={ onClose } fullWidth maxWidth="xs">
      <DialogTitle sx={ { fontWeight: 900, fontSize: '1.05rem' } }>{ targetType } 신고</DialogTitle>
      <DialogContent>
        { isDone ? (
          <Alert severity="success">
            신고가 접수되었습니다. 커뮤니티를 지켜주셔서 감사해요.
            동물 학대 의심 신고는 최우선으로 검토됩니다.
          </Alert>
        ) : (
          <>
            <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary', mb: 1 } }>
              신고 사유를 선택해주세요.
            </Typography>
            <RadioGroup value={ reason } onChange={ (event) => setReason(event.target.value) }>
              { REPORT_REASONS.map((item) => (
                <FormControlLabel
                  key={ item }
                  value={ item }
                  control={ <Radio size="small" /> }
                  label={ <Typography sx={ { fontSize: '0.88rem' } }>{ item }</Typography> }
                />
              )) }
            </RadioGroup>
            { error && <Alert severity="error" sx={ { mt: 1 } }>{ error }</Alert> }
          </>
        ) }
      </DialogContent>
      <DialogActions sx={ { px: 3, pb: 2 } }>
        <Button onClick={ onClose }>{ isDone ? '확인' : '취소' }</Button>
        { !isDone && (
          <Button variant="contained" color="error" onClick={ handleSubmit } disabled={ isSending } sx={ { fontWeight: 700 } }>
            { isSending ? '접수 중...' : '신고하기' }
          </Button>
        ) }
      </DialogActions>
    </Dialog>
  );
}

export default ReportDialog;
