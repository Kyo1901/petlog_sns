import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { HashRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/common/main-layout';
import ProtectedRoute from './components/common/protected-route';
import { AuthProvider } from './hooks/use-auth';
import CreatePostPage from './pages/create-post-page';
import ExplorePage from './pages/explore-page';
import HomePage from './pages/home-page';
import LoginPage from './pages/login-page';
import NotificationsPage from './pages/notifications-page';
import OnboardingPage from './pages/onboarding-page';
import PetFormPage from './pages/pet-form-page';
import PostDetailPage from './pages/post-detail-page';
import ProfilePage from './pages/profile-page';
import SignupPage from './pages/signup-page';

/**
 * BrandPanel 컴포넌트 — PC(lg 이상) 전용 좌측 브랜드 소개 패널
 *
 * Props: 없음
 *
 * Example usage:
 * <BrandPanel />
 */
function BrandPanel() {
  return (
    <Box
      sx={ {
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2.5,
        width: 360,
        pr: 8,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        alignSelf: 'flex-start',
      } }
    >
      <Typography sx={ { fontSize: '3.2rem', lineHeight: 1 } }>🐾</Typography>
      <Typography
        sx={ {
          fontFamily: '"Syne", "Noto Sans KR", sans-serif',
          fontWeight: 800,
          fontSize: '3.4rem',
          color: '#FBF5DD',
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
        } }
      >
        PetLog
      </Typography>
      <Typography
        sx={ {
          fontSize: '1.35rem',
          fontWeight: 900,
          color: '#FBF5DD',
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
        } }
      >
        반려동물과의 일상을{ '\n' }기록하고 공유하세요
      </Typography>
      <Typography sx={ { fontSize: '0.95rem', color: 'rgba(251, 245, 221, 0.8)', lineHeight: 1.6, whiteSpace: 'pre-line' } }>
        풀밭 위의 햇살처럼 싱그럽고 따뜻한{ '\n' }펫 오너들의 감성 커뮤니티
      </Typography>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 } }>
        { ['#감성피드', '#펫프로필', '#건강기록'].map((tag) => (
          <Chip
            key={ tag }
            label={ tag }
            sx={ {
              bgcolor: 'rgba(251, 245, 221, 0.16)',
              color: '#FBF5DD',
              fontWeight: 700,
              fontSize: '0.8rem',
            } }
          />
        )) }
      </Box>
    </Box>
  );
}

/**
 * App 컴포넌트 — PetLog 전체 라우팅
 * (모바일: 전체 화면 / PC: 브랜드 배경 + 소개 패널 + 480px 폰 프레임)
 *
 * Props: 없음
 *
 * Example usage:
 * <App />
 */
function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Box
          sx={ (theme) => ({
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0D1F0C 0%, #121712 55%, #1C231B 100%)'
              : 'linear-gradient(135deg, #0D530E 0%, #306D29 55%, #6FBF63 100%)',
          }) }
        >
          <BrandPanel />
          <Box
            sx={ {
              width: '100%',
              maxWidth: 480,
              minHeight: '100vh',
              bgcolor: 'background.default',
              boxShadow: { sm: '0 0 40px rgba(0, 0, 0, 0.3)' },
            } }
          >
            <Routes>
              <Route path="/login" element={ <LoginPage /> } />
              <Route path="/signup" element={ <SignupPage /> } />
              <Route
                path="/onboarding"
                element={ (
                  <ProtectedRoute isPetRequired={ false }>
                    <OnboardingPage />
                  </ProtectedRoute>
                ) }
              />
              <Route
                element={ (
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                ) }
              >
                <Route path="/" element={ <HomePage /> } />
                <Route path="/explore" element={ <ExplorePage /> } />
                <Route path="/notifications" element={ <NotificationsPage /> } />
                <Route path="/profile" element={ <ProfilePage /> } />
                <Route path="/pet/:petId" element={ <ProfilePage /> } />
              </Route>
              <Route
                path="/post/:postId"
                element={ (
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                ) }
              />
              <Route
                path="/create"
                element={ (
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                ) }
              />
              <Route
                path="/edit/:postId"
                element={ (
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                ) }
              />
              <Route
                path="/pets/new"
                element={ (
                  <ProtectedRoute>
                    <PetFormPage />
                  </ProtectedRoute>
                ) }
              />
              <Route
                path="/pets/:petId/edit"
                element={ (
                  <ProtectedRoute>
                    <PetFormPage />
                  </ProtectedRoute>
                ) }
              />
            </Routes>
          </Box>
          {/* 프레임을 화면 정중앙에 유지하기 위한 우측 대칭 여백 (하단 탭바 위치와 일치) */}
          <Box sx={ { display: { xs: 'none', lg: 'block' }, width: 360, flexShrink: 0 } } />
        </Box>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
