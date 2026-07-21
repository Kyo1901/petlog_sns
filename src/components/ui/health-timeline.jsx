import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EmptyState from './empty-state';
import HealthRecordForm from './health-record-form';
import { deleteHealthRecord, fetchHealthRecords } from '../../utils/health-api';

/* 기록 종류별 아이콘 */
const TYPE_ICONS = {
  예방접종: VaccinesIcon,
  건강검진: MonitorHeartIcon,
  구충: MedicationIcon,
};

/** 'yyyy-mm-dd' → 'yyyy.mm.dd' 표시용 */
function formatDate(dateString) {
  return dateString ? dateString.replaceAll('-', '.') : '';
}

/** 다음 예정일까지 남은 일수 (지난 날짜면 음수) */
function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${dateString}T00:00:00`) - today) / 86400000);
}

/**
 * HealthTimeline 컴포넌트 — 마이페이지 건강 기록 탭 (타임라인 + 추가/수정/삭제)
 *
 * Props:
 * @param {number} petId - 기록을 표시할 펫 id [Required]
 * @param {function} onChanged - 기록 변경(추가/수정/삭제) 후 실행 [Optional]
 *
 * Example usage:
 * <HealthTimeline petId={ pet.id } />
 */
function HealthTimeline({ petId, onChanged }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setRecords(await fetchHealthRecords(petId));
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = () => {
    load();
    onChanged?.();
  };

  const handleDelete = async (record) => {
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
    try {
      await deleteHealthRecord(record.id);
      onChanged?.();
    } catch {
      load();
    }
  };

  if (isLoading) {
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center', py: 6 } }>
        <CircularProgress size={ 28 } />
      </Box>
    );
  }

  return (
    <Box sx={ { px: 2, py: 2 } }>
      <Button
        variant="outlined"
        fullWidth
        startIcon={ <AddIcon /> }
        onClick={ () => { setEditingRecord(null); setIsFormOpen(true); } }
        sx={ { fontWeight: 700, mb: 2 } }
      >
        건강 기록 추가
      </Button>

      { records.length === 0 ? (
        <EmptyState
          icon={ <HealthAndSafetyIcon /> }
          title="아직 건강 기록이 없어요"
          description={ '예방접종 · 건강검진 · 구충 기록을 남기고\nD-day 리마인더를 받아보세요' }
        />
      ) : (
        <Box>
          { records.map((record, index) => {
            const TypeIcon = TYPE_ICONS[record.record_type] ?? HealthAndSafetyIcon;
            const dday = daysUntil(record.next_due_date);
            return (
              <Box key={ record.id } sx={ { display: 'flex', gap: 1.5 } }>
                {/* 타임라인 축 */}
                <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
                  <Box
                    sx={ {
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      flexShrink: 0,
                    } }
                  >
                    <TypeIcon sx={ { fontSize: 20 } } />
                  </Box>
                  { index < records.length - 1 && (
                    <Box sx={ { width: '2px', flexGrow: 1, bgcolor: 'divider', my: 0.5 } } />
                  ) }
                </Box>

                {/* 기록 카드 */}
                <Box sx={ { flexGrow: 1, pb: 2.5, minWidth: 0 } }>
                  <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' } }>
                    <Typography sx={ { fontSize: '0.9rem', fontWeight: 700 } }>{ record.title }</Typography>
                    <Chip label={ record.record_type } size="small" sx={ { fontSize: '0.65rem', height: 20 } } />
                    { dday !== null && dday >= 0 && dday <= 30 && (
                      <Chip
                        label={ dday === 0 ? '오늘 예정!' : `D-${dday}` }
                        size="small"
                        color={ dday <= 7 ? 'warning' : 'primary' }
                        sx={ { fontSize: '0.65rem', height: 20, fontWeight: 700 } }
                      />
                    ) }
                  </Box>
                  <Typography sx={ { fontSize: '0.75rem', color: 'text.secondary', mt: 0.4 } }>
                    { formatDate(record.record_date) }
                    { record.next_due_date ? ` · 다음 예정 ${formatDate(record.next_due_date)}` : '' }
                  </Typography>
                  { record.memo && (
                    <Typography sx={ { fontSize: '0.8rem', color: 'text.secondary', mt: 0.5, whiteSpace: 'pre-line' } }>
                      { record.memo }
                    </Typography>
                  ) }
                </Box>

                {/* 수정 · 삭제 */}
                <Box sx={ { display: 'flex', flexShrink: 0 } }>
                  <IconButton
                    size="small"
                    onClick={ () => { setEditingRecord(record); setIsFormOpen(true); } }
                    aria-label="기록 수정"
                  >
                    <EditOutlinedIcon sx={ { fontSize: 18 } } />
                  </IconButton>
                  <IconButton size="small" onClick={ () => handleDelete(record) } aria-label="기록 삭제">
                    <DeleteOutlineIcon sx={ { fontSize: 18 } } />
                  </IconButton>
                </Box>
              </Box>
            );
          }) }
        </Box>
      ) }

      <HealthRecordForm
        isOpen={ isFormOpen }
        onClose={ () => setIsFormOpen(false) }
        onSaved={ handleSaved }
        petId={ petId }
        record={ editingRecord }
      />
    </Box>
  );
}

export default HealthTimeline;
