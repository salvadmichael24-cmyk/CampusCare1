import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Get user from localStorage and listen for changes
  useEffect(() => {
    const getUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Initial load
    getUserFromStorage();

    // Listen for storage changes
    window.addEventListener('storage', getUserFromStorage);
    window.addEventListener('user-update', getUserFromStorage);

    return () => {
      window.removeEventListener('storage', getUserFromStorage);
      window.removeEventListener('user-update', getUserFromStorage);
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowProfileMenu(false);
        setShowSearch(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      sessionStorage.clear();
      setUser(null);
      window.dispatchEvent(new Event('user-update'));
      navigate('/');
      setShowProfileMenu(false);
    }
  };

  const isActive = (path) => {
    // Special handling for statistics/insights path
    if (path === '/statistics' && location.pathname.includes('/statistics')) {
      return true;
    }
    // Special handling for dashboard paths
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname === path;
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : '?';
  };

  // Pages where navbar should be hidden on mobile
  const isHiddenMobilePage = () => {
    const hiddenPages = ['/', '/login', '/register', '/forgot-password'];
    return hiddenPages.includes(location.pathname);
  };

  // Desktop Navigation
  if (!isMobile) {
    const navLinkStyle = (path) => ({
      color: '#1a1a2c',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      fontWeight: isActive(path) ? '600' : '400',
      background: isActive(path) ? 'rgba(67,97,238,0.1)' : 'transparent',
      color: isActive(path) ? '#4361ee' : '#1a1a2c'
    });

    return (
      <nav style={{
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0'
          }}>
            {/* Brand */}
            <Link to="/" style={{
              color: '#1a1a2c',
              textDecoration: 'none',
              fontSize: '22px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-building" style={{ color: '#4361ee' }}></i> 
              <span>CampusCare</span>
            </Link>

            {/* Navigation Menu */}
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {!user && (
                <>
                 
                </>
              )}
              
              {user && user.role === 'user' && (
                <>
                  <li>
                    <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                      <i className="bi bi-speedometer2"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/report/new" style={navLinkStyle('/report/new')}>
                      <i className="bi bi-plus-circle"></i>
                      <span>Create</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/statistics" style={navLinkStyle('/statistics')}>
                      <i className="bi bi-graph-up"></i>
                      <span>Insights</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" style={navLinkStyle('/profile')}>
                      <i className="bi bi-person-circle"></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                </>
              )}
              
              {user && user.role === 'admin' && (
                <>
                  <li>
                    <Link to="/admin" style={navLinkStyle('/admin')}>
                      <i className="bi bi-speedometer2"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/reports" style={navLinkStyle('/admin/reports')}>
                      <i className="bi bi-list-check"></i>
                      <span>Reports</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" style={navLinkStyle('/admin/users')}>
                      <i className="bi bi-people"></i>
                      <span>Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/statistics" style={navLinkStyle('/admin/statistics')}>
                      <i className="bi bi-graph-up"></i>
                      <span>Statistics</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" style={navLinkStyle('/profile')}>
                      <i className="bi bi-person-circle"></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                </>
              )}

              {/* Logout Button - Moved outside user check to show for all authenticated users */}
              {user && (
                <li>
                  <button
                    onClick={handleLogout}
                    style={{
                      color: '#ff4444',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      fontWeight: '400'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fff5f5';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  // Check if current page should hide navbar on mobile
  if (isHiddenMobilePage()) {
    return null; // Don't render anything on these pages
  }

  // Mobile Bottom Navigation for other pages
  return (
    <>
      {/* Mobile Header */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} style={{
          color: '#1a1a2c',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <i className="bi bi-building" style={{ color: '#4361ee' }}></i> 
          <span>CampusCare</span>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              {getUserInitials()}
            </div>
          )}
        </div>
      </div>

     
      
      {/* Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        zIndex: 1000,
        borderTop: '1px solid #e9ecef',
        padding: '8px 0 12px 0'
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          background: '#ddd',
          borderRadius: '2px',
          margin: '8px auto 12px auto'
        }} />

        {!user ? (
          // Non-authenticated bottom nav - NO HOME BUTTON
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 10px'
          }}>
            <Link to="/login" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive('/login') ? '#4361ee' : '#6c757d',
              fontSize: '12px',
              gap: '4px'
            }}>
              <i className="bi bi-box-arrow-in-right" style={{ fontSize: '22px' }}></i>
              <span>Login</span>
            </Link>

            <Link to="/register" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive('/register') ? '#4361ee' : '#6c757d',
              fontSize: '12px',
              gap: '4px'
            }}>
              <i className="bi bi-person-plus" style={{ fontSize: '22px' }}></i>
              <span>Register</span>
            </Link>
          </div>
        ) : (
          // Authenticated bottom nav - REPLACED HOME WITH DASHBOARD
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 10px'
          }}>
            {/* Dashboard - replaces Home */}
            <Link 
              to={user.role === 'admin' ? '/admin' : '/dashboard'} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: isActive(user.role === 'admin' ? '/admin' : '/dashboard') ? '#4361ee' : '#6c757d',
                fontSize: '12px',
                gap: '4px'
              }}
            >
              <i className="bi bi-speedometer2" style={{ fontSize: '22px' }}></i>
              <span>Dashboard</span>
            </Link>

            <Link to={user.role === 'admin' ? "/admin/reports/new" : "/report/new"} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive('/report/new') ? '#4361ee' : '#6c757d',
              fontSize: '12px',
              gap: '4px'
            }}>
              <i className="bi bi-plus-circle-fill" style={{ fontSize: '22px' }}></i>
              <span>Create</span>
            </Link>

            <Link to={user.role === 'admin' ? "/admin/statistics" : "/statistics"} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive('/statistics') ? '#4361ee' : '#6c757d',
              fontSize: '12px',
              gap: '4px'
            }}>
              <i className="bi bi-bar-chart-fill" style={{ fontSize: '22px' }}></i>
              <span>Insights</span>
            </Link>

            <div className="profile-menu-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: showProfileMenu ? '#4361ee' : '#6c757d',
                  fontSize: '12px',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <i className="bi bi-person-circle" style={{ fontSize: '22px' }}></i>
                <span>Profile</span>
              </button>

              {/* Profile Popup Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '70px',
                  right: '0',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                  width: '180px',
                  overflow: 'hidden',
                  animation: 'slideUp 0.2s ease'
                }}>
                  

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '15px',
                      textDecoration: 'none',
                      color: '#1a1a2c',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <i className="bi bi-person" style={{ color: '#4361ee' }}></i>
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '15px',
                      width: '100%',
                      border: 'none',
                      background: 'white',
                      color: '#ff4444',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}

export default Navbar;