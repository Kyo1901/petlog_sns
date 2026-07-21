import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { RECORD_TYPES, createHealthRecord, updateHealthRecord } from '../../utils/health-api';

/**
 * HealthRecordForm 컴포넌트 — 건강 기록 추가 · 수정 다이얼로그
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 * @param {function} onSaved - 저장 성공 시 실행할 함수 [Required]
 * @param {number} petId - 기록 대상 펫 id [Required]
 * @param {object} record - 수정할 기존 기록 (없으면 추가 모드) [Optional, 기본값: null]
 *
 * Example usage:
 * <HealthRecordForm isOpen={ isOpen } onClose={ close } onSaved={ reload } petId={ pet.id } />
 */
function HealthRecordForm({ isOpen, onClose, onSaved, petId, record = null }) {
  const isEdit = Boolean(record);
  const [values, setValues] = useState({
    recordType: RECORD_TYPES[0],
    title: '',
    recordDate: '',
    nextDueDate: '',
    memo: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* 다이얼로그가 열릴 때 기존 기록 값으로 초기화 */
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setValues({
      recordType: record?.record_type ?? RECORD_TYPES[0],
      title: record?.title ?? '',
      recordDate: record?.record_date ?? '',
      nextDueDate: record?.next_due_date ?? '',
      memo: record?.memo ?? '',
    });
  }, [isOpen, record]);

  const handleChange = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!values.title.trim()) {
      setError('기록 이름을 입력해주세요. (예: 종합백신 3차)');
      return;
    }
    if (!values.recordDate) {
      setError('접종·검진한 날짜를 선택해주세요.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const payload = {
        petId,
        recordType: values.recordType,
        title: values.title.trim(),
        recordDate: values.recordDate,
        nextDueDate: values.nextDueDate,
        memo: values.memo.trim(),
      };
      if (isEdit) {
        await updateHealthRecord({ recordId: record.id, ...payload });
      } else {
        await createHealthRecord(payload);
      }
      onSaved();
      onClose();
    } catch {
      setError('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={ isOpen } onClose={ onClose } fullWidth maxWidth="xs">
      <DialogTitle sx={ { fontWeight: 900, fontSize: '1.05rem' } }>
        { isEdit ? '건강 기록 수정' : '건강 기록 추가' }
      </DialogTitle>
      <DialogContent sx={ { display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' } }>
        <TextField label="기록 종류" value={ values.recordType } onChange={ handleChange('recordType') } select fullWidth>
          { RECORD_TYPES.map((type) => (
            <MenuItem key={ type } value={ type }>{ type }</MenuItem>
          )) }
        </TextField>
        <TextField
          label="기록 이름"
          value={ values.title }
          onChange={ handleChange('title') }
          placeholder="예: 종합백신 3차"
          required
          fullWidth
        />
        <TextField
          label="날짜"
          type="date"
          value={ values.recordDate }
          onChange={ handleChange('recordDate') }
          required
          fullWidth
          slotProps={ { inputLabel: { shrink: true } } }
        />
        <TextField
          label="다음 예정일 (선택)"
          type="date"
          value={ values.nextDueDate }
          onChange={ handleChange('nextDueDate') }
          fullWidth
          slotProps={ { inputLabel: { shrink: true } } }
          helperText="입력하면 D-7에 리마인더 알림을 보내드려요"
        />
        <TextField
          label="메모 (선택)"
          value={ values.memo }
          onChange={ handleChange('memo') }
          placeholder="병원 이름, 특이사항 등"
          multiline
          rows={ 2 }
          fullWidth
        />
        { error && <Alert severity="error">{ error }</Alert> }
      </DialogContent>
      <DialogActions sx={ { px: 3, pb: 2 } }>
        <Button onClick={ onClose }>취소</Button>
        <Button variant="contained" onClick={ handleSubmit } disabled={ isSaving } sx={ { fontWeight: 700 } }>
          { isSaving ? '저장 중...' : isEdit ? '수정' : '추가' }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HealthRecordForm;
