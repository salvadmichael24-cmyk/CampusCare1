import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Check for existing lock on component mount
  useEffect(() => {
    const lockUntil = localStorage.getItem('loginLockUntil');
    if (lockUntil) {
      const timeLeft = Math.ceil((parseInt(lockUntil) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockTimer(timeLeft);
      } else {
        localStorage.removeItem('loginLockUntil');
        localStorage.removeItem('loginAttempts');
      }
    }

    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem('loginLockUntil');
            localStorage.removeItem('loginAttempts');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${lockTimer} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await login(form.username, form.password);
      console.log('Login response:', res.data);
      
      // Check if login was successful
      if (res.data.success && res.data.user) {
        // Reset attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockUntil');
        setAttempts(0);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Force a hard reload to ensure App reads the new user
        if (res.data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      
      // Show alert for wrong password
      alert('❌ Incorrect username or password. Please try again.');
      
      // Increment failed attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      // Check if max attempts reached (3 attempts)
      if (newAttempts >= 3) {
        const lockTime = Date.now() + 60000; // 1 minute lock
        localStorage.setItem('loginLockUntil', lockTime.toString());
        setIsLocked(true);
        setLockTimer(60);
        setError('❌ Too many failed attempts. Account locked for 1 minute.');
        
        // Show lock alert
        alert('⏰ Too many failed attempts! Account locked for 1 minute.');
      } else {
        const remainingAttempts = 3 - newAttempts;
        setError(`❌ ${err.response?.data?.error || 'Login failed'}. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: isMobile ? '20px 30px' : '30px 50px',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        color: '#0066ff',
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '500',
        textAlign: 'center'
      }}>
        <i className="bi bi-arrow-repeat" style={{ marginRight: '10px', animation: 'spin 1s infinite linear' }}></i>
        Logging in...
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '10px' : '20px',
      position: 'relative'
    }}>
      {/* Background Pattern - preserved */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: isMobile ? '30px 30px' : '40px 40px',
        pointerEvents: 'none'
      }}></div>

      {/* Animated background elements - preserved but scaled for mobile */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: isMobile ? '300px' : '400px',
        height: isMobile ? '300px' : '400px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0066ff40 0%, #00c6ff30 100%)',
        filter: 'blur(80px)',
        zIndex: 0,
        animation: 'float 20s infinite alternate'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: isMobile ? '300px' : '400px',
        height: isMobile ? '300px' : '400px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00c6ff30 0%, #0066ff40 100%)',
        filter: 'blur(80px)',
        zIndex: 0,
        animation: 'float 15s infinite alternate-reverse'
      }}></div>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: isMobile ? '25px' : '40px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.6s ease-out',
        margin: isMobile ? '10px' : '0'
      }}>
        {/* Header with icon */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
          <div style={{
            width: isMobile ? '70px' : '80px',
            height: isMobile ? '70px' : '80px',
            background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(0,102,255,0.3)'
          }}>
            <i className="bi bi-box-arrow-in-right" style={{ fontSize: isMobile ? '32px' : '40px', color: 'white' }}></i>
          </div>
          <h1 style={{
            color: '#333',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>Welcome Back</h1>
          <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px', margin: 0 }}>
            Sign in to continue to CampusCare
          </p>
          {isLocked && (
            <div style={{
              marginTop: '10px',
              color: '#ff4444',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600'
            }}>
              <i className="bi bi-lock-fill"></i> Locked for {lockTimer}s
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#ffffff',
            padding: isMobile ? '12px 16px' : '16px 20px',
            borderRadius: '12px',
            marginBottom: '25px',
            border: 'none',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideDown 0.3s ease-out',
            fontSize: isMobile ? '13px' : '14px'
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#333', 
              marginBottom: '8px', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-person" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required
              disabled={loading || isLocked}
              style={{
                width: '100%',
                padding: isMobile ? '12px 14px' : '14px 16px',
                background: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                color: '#333',
                fontSize: isMobile ? '14px' : '15px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0066ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              color: '#333', 
              marginBottom: '8px', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-lock" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                disabled={loading || isLocked}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  paddingRight: '50px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: isMobile ? '14px' : '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: showPassword ? '#0066ff' : '#999',
                  fontSize: isMobile ? '18px' : '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#0066ff'}
                onMouseLeave={(e) => e.target.style.color = showPassword ? '#0066ff' : '#999'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '25px' }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: '#0066ff', 
                textDecoration: 'none', 
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#0052cc'}
              onMouseLeave={(e) => e.target.style.color = '#0066ff'}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '16px',
              background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '700',
              cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
              opacity: (loading || isLocked) ? 0.7 : 1,
              marginBottom: '20px',
              boxShadow: '0 10px 20px rgba(0,102,255,0.3)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!loading && !isLocked) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 30px rgba(0,102,255,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isLocked) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 20px rgba(0,102,255,0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                LOGGING IN...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                LOGIN
              </>
            )}
          </button>
        </form>

        <Link 
          to="/register"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: isMobile ? '14px' : '16px',
            background: 'transparent',
            color: '#0066ff',
            border: '2px solid #0066ff',
            borderRadius: '12px',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '700',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.3s',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#0066ff';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 10px 20px rgba(0,102,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#0066ff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-person-plus"></i>
          CREATE ACCOUNT
        </Link>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link 
            to="/"
            style={{
              color: '#999',
              textDecoration: 'none',
              fontSize: isMobile ? '13px' : '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0066ff'}
            onMouseLeave={(e) => e.target.style.color = '#999'}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Animation keyframes - preserved exactly */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            100% {
              transform: translate(50px, 50px) rotate(180deg);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;