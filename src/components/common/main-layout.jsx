import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import BottomNav from './bottom-nav';

/**
 * MainLayout 컴포넌트 — 하단 탭바가 있는 메인 화면 공통 레이아웃
 *
 * Props: 없음 (라우터 Outlet 사용)
 *
 * Example usage:
 * <Route element={ <MainLayout /> }>...</Route>
 */
function MainLayout() {
  return (
    <Box sx={ { pb: 10, minHeight: '100vh' } }>
      <Outlet />
      <BottomNav />
    </Box>
  );
}

export default MainLayout;
