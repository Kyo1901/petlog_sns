import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * BottomNav 컴포넌트 — 하단 탭바 [홈] [탐색] [+작성 FAB] [알림] [마이]
 *
 * Props: 없음 (라우터 위치로 활성 탭 판단)
 *
 * Example usage:
 * <BottomNav />
 */
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', label: '홈', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon /> },
    { path: '/explore', label: '탐색', icon: <SearchIcon />, activeIcon: <SearchIcon /> },
    { path: '/notifications', label: '알림', icon: <NotificationsOutlinedIcon />, activeIcon: <NotificationsIcon /> },
    { path: '/profile', label: '마이', icon: <PersonOutlinedIcon />, activeIcon: <PersonIcon /> },
  ];

  /** 탭 버튼 1개 렌더링 */
  const renderTab = (tab) => {
    const isActive = location.pathname === tab.path;
    const icon = isActive ? tab.activeIcon : tab.icon;
    return (
      <IconButton
        key={ tab.path }
        onClick={ () => navigate(tab.path) }
        aria-label={ tab.label }
        sx={ {
          flex: 1,
          height: 56,
          borderRadius: 0,
          flexDirection: 'column',
          gap: 0.25,
          color: isActive ? 'primary.main' : 'text.secondary',
        } }
      >
        { tab.label === '알림' ? (
          <Badge badgeContent={ 0 } color="error">{ icon }</Badge>
        ) : icon }
        <Typography sx={ { fontSize: '0.65rem', fontWeight: isActive ? 700 : 400 } }>
          { tab.label }
        </Typography>
      </IconButton>
    );
  };

  return (
    <Paper
      elevation={ 8 }
      square
      sx={ {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
      } }
    >
      <Box sx={ { display: 'flex', alignItems: 'center', height: 56 } }>
        { renderTab(tabs[0]) }
        { renderTab(tabs[1]) }
        <Box sx={ { flex: 1, display: 'flex', justifyContent: 'center' } }>
          <Fab
            color="primary"
            size="medium"
            onClick={ () => navigate('/create') }
            aria-label="게시물 작성"
            sx={ { mt: -3, width: 56, height: 56, boxShadow: 4 } }
          >
            <AddIcon />
          </Fab>
        </Box>
        { renderTab(tabs[2]) }
        { renderTab(tabs[3]) }
      </Box>
    </Paper>
  );
}

export default BottomNav;
