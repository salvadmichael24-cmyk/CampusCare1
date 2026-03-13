import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyCode, resetPasswordWithCode } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message || 'A 6-digit code has been sent to your email.');
      setStep(2);
    } catch (err) {
      console.error('Send code error:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyCode(email, code);
      console.log('Verify response:', response.data);
      setMessage('Code verified! Please enter your new password.');
      setStep(3);
    } catch (err) {
      console.error('Verify code error:', err.response?.data);
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resetPasswordWithCode(email, code, newPassword);
      console.log('Reset response:', response.data);
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Background Pattern */}
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

      {/* Animated background elements */}
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
            <i className="bi bi-key" style={{ fontSize: isMobile ? '32px' : '40px', color: 'white' }}></i>
          </div>
          <h1 style={{
            color: '#333',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Enter Code'}
            {step === 3 && 'New Password'}
          </h1>
          <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px', margin: 0 }}>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && `Check your email for the 6-digit code`}
            {step === 3 && 'Enter your new password'}
          </p>
        </div>

        {message && (
          <div style={{
            background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
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
            <i className="bi bi-check-circle-fill" style={{ fontSize: '20px' }}></i>
            {message}
          </div>
        )}

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

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-envelope" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '20px',
                boxShadow: '0 10px 20px rgba(0,102,255,0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(0,102,255,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(0,102,255,0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                  SENDING...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i>
                  SEND CODE
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-123" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
                6-Digit Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                maxLength="6"
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{ color: '#999', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '10px',
                boxShadow: '0 10px 20px rgba(0,102,255,0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(0,102,255,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(0,102,255,0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                  VERIFYING...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  VERIFY CODE
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                padding: isMobile ? '12px' : '14px',
                background: 'transparent',
                color: '#0066ff',
                border: '2px solid #0066ff',
                borderRadius: '12px',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0066ff';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0066ff';
              }}
            >
              <i className="bi bi-arrow-left"></i>
              BACK TO EMAIL
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
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
                <i className="bi bi-lock" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
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

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-lock-fill" style={{ color: '#0066ff', fontSize: isMobile ? '14px' : '16px' }}></i>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: '10px',
                boxShadow: '0 10px 20px rgba(0,102,255,0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(0,102,255,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(0,102,255,0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                  RESETTING...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  RESET PASSWORD
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: isMobile ? '12px' : '14px',
                background: 'transparent',
                color: '#0066ff',
                border: '2px solid #0066ff',
                borderRadius: '12px',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0066ff';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0066ff';
              }}
            >
              <i className="bi bi-arrow-left"></i>
              BACK TO CODE
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link 
            to="/login"
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
            Back to Login
          </Link>
        </div>
      </div>

      {/* Animation keyframes */}
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

export default ForgotPassword;