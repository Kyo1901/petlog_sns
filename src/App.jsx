import Box from '@mui/material/Box';
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
 * App 컴포넌트 — PetLog 전체 라우팅 (모바일 웹 480px 프레임)
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
          sx={ {
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'center',
          } }
        >
          <Box
            sx={ {
              width: '100%',
              maxWidth: 480,
              minHeight: '100vh',
              bgcolor: 'background.default',
              borderLeft: { sm: 1 },
              borderRight: { sm: 1 },
              borderColor: { sm: 'divider' },
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
        </Box>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
