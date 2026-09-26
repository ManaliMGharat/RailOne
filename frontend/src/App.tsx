import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

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

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Application Layout wrapper */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              
              {/* Authentication */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify-otp" element={<LoginPage />} />

              {/* Ticketing & Journey Modes */}
              <Route path="reserved" element={<ReservedSearchPage />} />
              <Route path="journey" element={<ReservedSearchPage />} />
              <Route path="unreserved" element={<UTSPage />} />
              <Route path="platform" element={<UTSPage />} />
              <Route path="season" element={<UTSPage />} />

              {/* Trains & Tracking */}
              <Route path="trains" element={<TrainSearchPage />} />
              <Route path="trains/:id" element={<TrainDetailPage />} />
              <Route path="pnr" element={<PNRStatusPage />} />
              <Route path="coach-position" element={<CoachPositionPage />} />
              <Route path="track" element={<TrackTrainPage />} />

              {/* Passenger Services */}
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/:id" element={<BookingsPage />} />
              <Route path="tickets" element={<BookingsPage />} />
              <Route path="tickets/:id" element={<BookingsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="food" element={<FoodOrderingPage />} />
              <Route path="food/:restaurantId" element={<FoodOrderingPage />} />
              <Route path="refunds" element={<RefundsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Admin */}
              <Route path="admin" element={<AdminPage />} />

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
