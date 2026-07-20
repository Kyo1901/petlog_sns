import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * EmptyState 컴포넌트 — 데이터가 없을 때 표시하는 빈 상태 화면
 *
 * Props:
 * @param {node} icon - 상단 아이콘 [Required]
 * @param {string} title - 안내 제목 [Required]
 * @param {string} description - 보조 설명 [Optional]
 * @param {node} action - 하단 액션 버튼 영역 [Optional]
 *
 * Example usage:
 * <EmptyState icon={ <PetsIcon /> } title="아직 게시물이 없어요" />
 */
function EmptyState({ icon, title, description, action }) {
  return (
    <Box
      sx={ {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: { xs: 8, md: 10 },
        px: 3,
        gap: 1,
      } }
    >
      <Box sx={ { color: 'text.disabled', '& svg': { fontSize: 64 } } }>{ icon }</Box>
      <Typography sx={ { fontSize: '1.05rem', fontWeight: 700, color: 'text.primary' } }>
        { title }
      </Typography>
      { description && (
        <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary', whiteSpace: 'pre-line' } }>
          { description }
        </Typography>
      ) }
      { action && <Box sx={ { mt: 2 } }>{ action }</Box> }
    </Box>
  );
}

export default EmptyState;
