import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * AppHeader 컴포넌트 — 상단 앱바 (로고 또는 페이지 제목)
 *
 * Props:
 * @param {string} title - 페이지 제목 (없으면 PetLog 로고 표시) [Optional]
 * @param {boolean} hasBack - 뒤로가기 버튼 표시 여부 [Optional, 기본값: false]
 * @param {node} children - 우측 액션 영역 [Optional]
 *
 * Example usage:
 * <AppHeader title="게시물" hasBack />
 */
function AppHeader({ title, hasBack = false, children }) {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={ 0 }
      sx={ {
        bgcolor: 'background.default',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      } }
    >
      <Toolbar sx={ { minHeight: { xs: 56 }, px: 2, gap: 1 } }>
        { hasBack && (
          <IconButton edge="start" onClick={ () => navigate(-1) } aria-label="뒤로가기" sx={ { color: 'text.primary' } }>
            <ArrowBackIcon />
          </IconButton>
        ) }
        { title ? (
          <Typography sx={ { fontSize: '1.1rem', fontWeight: 900, flexGrow: 1 } }>
            { title }
          </Typography>
        ) : (
          <Typography
            sx={ {
              fontFamily: '"Syne", "Noto Sans KR", sans-serif',
              fontWeight: 800,
              fontSize: '1.5rem',
              color: 'primary.main',
              flexGrow: 1,
              letterSpacing: '-0.5px',
            } }
          >
            PetLog
          </Typography>
        ) }
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>{ children }</Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
