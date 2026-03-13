import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Import all pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ReportDetail from './pages/ReportDetail';
import { UserDashboard, NewReport, Profile, UserStatistics } from './pages/user';
import { AdminDashboard, AdminReports, AdminUsers, AdminStatistics } from './pages/admin';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('📦 Stored user from localStorage:', storedUser); // Debug log
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ Parsed user:', parsedUser); // Debug log
        console.log('👤 User role:', parsedUser.role); // Debug log for role
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Failed to parse user:', e);
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No user found in localStorage');
    }
    setLoading(false);
  }, []);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading...</div>;

  console.log('👤 Current user state in App:', user); // Debug log for current user state
  console.log('🔍 Current path:', window.location.pathname);

  return (
    <BrowserRouter>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: '#0a0a0a'
      }}>
        <Navbar />
        <main style={{ flex: '1 0 auto' }}>
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/report/:id" element={<ReportDetail />} />

            {/* Protected routes - require login */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'user' ? (
                    <UserDashboard />
                  ) : (
                    <Navigate to="/admin" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/report/new" 
              element={user ? <NewReport /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/statistics" 
              element={user ? <UserStatistics /> : <Navigate to="/login" />} 
            />

            {/* Admin routes - require admin role */}
            <Route 
              path="/admin" 
              element={
                user && user.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to={user ? '/dashboard' : '/'} />
                )
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                user && user.role === 'admin' ? (
                  <AdminReports />
                ) : (
                  <Navigate to={user ? '/dashboard' : '/'} />
                )
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                user && user.role === 'admin' ? (
                  <AdminUsers />
                ) : (
                  <Navigate to={user ? '/dashboard' : '/'} />
                )
              } 
            />
            <Route 
              path="/admin/statistics" 
              element={
                user && user.role === 'admin' ? (
                  <AdminStatistics />
                ) : (
                  <Navigate to={user ? '/dashboard' : '/'} />
                )
              } 
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;