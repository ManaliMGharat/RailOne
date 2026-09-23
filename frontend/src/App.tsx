import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { TrainSearch } from './pages/TrainSearch';
import { BookingFlow } from './pages/BookingFlow';
import { PnrStatusPage } from './pages/PnrStatus';
import { MyBookings } from './pages/MyBookings';
import { TicketView } from './pages/TicketView';
import { UserProfile } from './pages/UserProfile';
import { Services } from './pages/Services';
import { HelpSupport } from './pages/HelpSupport';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTrains } from './pages/admin/AdminTrains';
import { AdminStations } from './pages/admin/AdminStations';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rail-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const LayoutWithNavFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Passenger Routes */}
          <Route
            path="/"
            element={
              <LayoutWithNavFooter>
                <Home />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/search"
            element={
              <LayoutWithNavFooter>
                <TrainSearch />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/book"
            element={
              <LayoutWithNavFooter>
                <ProtectedRoute>
                  <BookingFlow />
                </ProtectedRoute>
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/pnr"
            element={
              <LayoutWithNavFooter>
                <PnrStatusPage />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/bookings"
            element={
              <LayoutWithNavFooter>
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/ticket/:pnr"
            element={
              <LayoutWithNavFooter>
                <TicketView />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/profile"
            element={
              <LayoutWithNavFooter>
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/services"
            element={
              <LayoutWithNavFooter>
                <Services />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/help"
            element={
              <LayoutWithNavFooter>
                <HelpSupport />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/login"
            element={
              <LayoutWithNavFooter>
                <Login />
              </LayoutWithNavFooter>
            }
          />
          <Route
            path="/register"
            element={
              <LayoutWithNavFooter>
                <Register />
              </LayoutWithNavFooter>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="trains" element={<AdminTrains />} />
            <Route path="stations" element={<AdminStations />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
