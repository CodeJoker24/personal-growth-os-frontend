import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Habits from './pages/Habits.jsx';
import Coding from './pages/Coding.jsx';
import Study from './pages/Study.jsx';
import Journal from './pages/Journal.jsx';
import Finance from './pages/Finance.jsx';
import Goals from './pages/Goals.jsx';
import Admin from './pages/Admin.jsx';
import Profile from './pages/Profile.jsx';
import BottomNav from './components/BottomNav.jsx';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import VerificationBanner from './components/VerificationBanner.jsx';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  const noChromeRoutes = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/verify-email'];
  // The root path shows the marketing Landing page (no app chrome) when logged
  // out, and the Dashboard (with sidebar/nav) when logged in.
  const isBareLanding = location.pathname === '/' && !user;
  const hideNav = noChromeRoutes.includes(location.pathname) || isBareLanding;

  return (
    <div className="min-h-screen bg-panel font-body">
      {!hideNav && <VerificationBanner />}
      {!hideNav && <Sidebar />}
      <div className={!hideNav ? 'content-shell' : ''}>
        <Routes>
          <Route path="/" element={user ? <ProtectedRoute><Dashboard /></ProtectedRoute> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><Coding /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
