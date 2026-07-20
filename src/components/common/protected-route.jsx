import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

/**
 * ProtectedRoute 컴포넌트 — 로그인 · 펫 프로필 등록 여부에 따른 접근 제어
 *
 * Props:
 * @param {node} children - 보호할 페이지 [Required]
 * @param {boolean} isPetRequired - 펫 프로필 필수 여부 (없으면 온보딩으로 이동) [Optional, 기본값: true]
 *
 * Example usage:
 * <ProtectedRoute><HomePage /></ProtectedRoute>
 */
function ProtectedRoute({ children, isPetRequired = true }) {
  const { session, pets, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } }>
        <CircularProgress />
      </Box>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (isPetRequired && pets.length === 0) return <Navigate to="/onboarding" replace />;
  return children;
}

export default ProtectedRoute;
