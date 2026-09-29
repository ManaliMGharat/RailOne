import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReservedSearchPage } from './pages/ReservedSearchPage';
import { UTSPage } from './pages/UTSPage';
import { TrainSearchPage } from './pages/TrainSearchPage';
import { TrainDetailPage } from './pages/TrainDetailPage';
import { PNRStatusPage } from './pages/PNRStatusPage';
import { CoachPositionPage } from './pages/CoachPositionPage';
import { TrackTrainPage } from './pages/TrackTrainPage';
import { BookingsPage } from './pages/BookingsPage';
import { WalletPage } from './pages/WalletPage';
import { FoodOrderingPage } from './pages/FoodOrderingPage';
import { RefundsPage } from './pages/RefundsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { WavesPage } from './pages/WavesPage';

/**
 * RootRoute:
 * - When authenticating: shows AuthLoadingScreen
 * - When unauthenticated: redirects to /register (First-time / new visitor flow)
 * - When authenticated: renders personalized HomePage dashboard
 */
const RootRoute: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user && !token) {
    return <Navigate to="/register" replace />;
  }

  return <HomePage />;
};

/**
 * ProtectedRoute:
 * - When authenticating: shows AuthLoadingScreen
 * - When unauthenticated: redirects to /login with redirect state
 * - When authenticated: renders protected page
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user && !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute:
 * - For /login and /register
 * - If already authenticated: redirects to /profile
 * - If unauthenticated: renders login / register form
 */
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user || token) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

/**
 * AdminRoute:
 * - Requires authenticated user with admin role
 */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user && !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Application Layout wrapper */}
            <Route path="/" element={<AppLayout />}>
              {/* Root URL handler: new users see Register first, authenticated users see Home */}
              <Route index element={<RootRoute />} />
              <Route path="home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              
              {/* Authentication (Public only for non-logged in users) */}
              <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
              <Route path="verify-otp" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

              {/* Ticketing & Journey Modes (Protected booking workflows) */}
              <Route path="reserved" element={<ProtectedRoute><ReservedSearchPage /></ProtectedRoute>} />
              <Route path="journey" element={<ProtectedRoute><ReservedSearchPage /></ProtectedRoute>} />
              <Route path="unreserved" element={<ProtectedRoute><UTSPage /></ProtectedRoute>} />
              <Route path="platform" element={<ProtectedRoute><UTSPage /></ProtectedRoute>} />
              <Route path="season" element={<ProtectedRoute><UTSPage /></ProtectedRoute>} />

              {/* Trains & Tracking (Public inquiry pages) */}
              <Route path="trains" element={<TrainSearchPage />} />
              <Route path="trains/:id" element={<TrainDetailPage />} />
              <Route path="pnr" element={<PNRStatusPage />} />
              <Route path="coach-position" element={<CoachPositionPage />} />
              <Route path="track" element={<TrackTrainPage />} />

              {/* Passenger Services (Protected private data) */}
              <Route path="bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="bookings/:id" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="tickets" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="tickets/:id" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="refunds" element={<ProtectedRoute><RefundsPage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Food Ordering, Support & Waves */}
              <Route path="food" element={<FoodOrderingPage />} />
              <Route path="food/:restaurantId" element={<FoodOrderingPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="waves" element={<WavesPage />} />

              {/* Admin */}
              <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
