import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout, { ProtectedRoute } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Passengers from './pages/Passengers';
import Tracking from './pages/Tracking';
import ActivityLog from './pages/ActivityLog';
import Finance from './pages/Finance';
import UserManagement from './pages/UserManagement';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><ProtectedRoute permission="dashboard.view"><Dashboard /></ProtectedRoute></PrivateRoute>} />
      
      {/* Bookings */}
      <Route path="/bookings" element={<PrivateRoute><ProtectedRoute permission="booking.view"><Bookings /></ProtectedRoute></PrivateRoute>} />
      <Route path="/bookings/:area" element={<PrivateRoute><ProtectedRoute permission="booking.view"><Bookings /></ProtectedRoute></PrivateRoute>} />
      
      {/* Passengers */}
      <Route path="/passengers" element={<PrivateRoute><ProtectedRoute permission="passenger.view"><Passengers /></ProtectedRoute></PrivateRoute>} />
      
      {/* Tracking */}
      <Route path="/tracking" element={<PrivateRoute><ProtectedRoute permission="tracking.view"><Tracking /></ProtectedRoute></PrivateRoute>} />
      <Route path="/activity-log" element={<PrivateRoute><ProtectedRoute permission="activity.view"><ActivityLog /></ProtectedRoute></PrivateRoute>} />
      
      {/* Finance - all sub-routes handled by Finance component */}
      <Route path="/finance" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/daily" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/monthly" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/income" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/expense" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/outstanding" element={<PrivateRoute><ProtectedRoute permission="finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      <Route path="/finance/reports" element={<PrivateRoute><ProtectedRoute permission="report.finance.view"><Finance /></ProtectedRoute></PrivateRoute>} />
      
      {/* User Management */}
      <Route path="/users" element={<PrivateRoute><ProtectedRoute permission="user.view"><UserManagement /></ProtectedRoute></PrivateRoute>} />
      <Route path="/users/permissions" element={<PrivateRoute><ProtectedRoute permission="user.permission.manage"><UserManagement /></ProtectedRoute></PrivateRoute>} />
      
      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
}
