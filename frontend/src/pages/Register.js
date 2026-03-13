import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    department: 'BSIT',
    block: '1',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password match check
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('1. Sending registration data:', form);
      console.log('2. API URL:', 'http://localhost:5000/api/register');
      
      const res = await register(form);
      
      console.log('3. Response received:', res);
      console.log('4. Response data:', res.data);
      
      if (res.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(res.data.error || 'Registration failed');
      }
    } catch (err) {
      console.log('5. ERROR CAUGHT!');
      console.log('6. Error object:', err);
      console.log('7. Error response:', err.response);
      console.log('8. Error data:', err.response?.data);
      console.log('9. Error status:', err.response?.status);
      console.log('10. Error message:', err.message);
      console.log('11. Error code:', err.code);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if backend is running at http://localhost:5000');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Invalid registration data');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
        padding: '30px 50px',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        color: '#0066ff',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        <i className="bi bi-arrow-repeat" style={{ marginRight: '10px', animation: 'spin 1s infinite linear' }}></i>
        Creating account...
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
      padding: '20px',
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
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }}></div>

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0066ff40 0%, #00c6ff30 100%)',
        filter: 'blur(100px)',
        zIndex: 0,
        animation: 'float 20s infinite alternate'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00c6ff30 0%, #0066ff40 100%)',
        filter: 'blur(100px)',
        zIndex: 0,
        animation: 'float 15s infinite alternate-reverse'
      }}></div>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '550px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.6s ease-out',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header with icon */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(0,102,255,0.3)'
          }}>
            <i className="bi bi-person-plus" style={{ fontSize: '40px', color: 'white' }}></i>
          </div>
          <h1 style={{
            color: '#333',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>Create Account</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Join the CampusCare community
          </p>
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '25px',
            border: 'none',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Name & Last Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-person" style={{ color: '#0066ff' }}></i>
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
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
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-person" style={{ color: '#0066ff' }}></i>
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
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
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#333', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-person-badge" style={{ color: '#0066ff' }}></i>
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                color: '#333',
                fontSize: '14px',
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

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#333', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-envelope" style={{ color: '#0066ff' }}></i>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                color: '#333',
                fontSize: '14px',
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

          {/* Department & Block Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-building" style={{ color: '#0066ff' }}></i>
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({...form, department: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="BSIT">BSIT</option>
                <option value="BSOA">BSOA</option>
              </select>
            </div>
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-grid-3x3" style={{ color: '#0066ff' }}></i>
                Block
              </label>
              <select
                value={form.block}
                onChange={(e) => setForm({...form, block: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Block {n}</option>)}
              </select>
            </div>
          </div>

          {/* Password & Confirm Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-lock" style={{ color: '#0066ff' }}></i>
                Password
              </label>
              <input
                type="password"
                placeholder="Create password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
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
            <div>
              <label style={{ 
                color: '#333', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-shield-lock" style={{ color: '#0066ff' }}></i>
                Confirm
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirm_password}
                onChange={(e) => setForm({...form, confirm_password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '14px',
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
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
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
                REGISTERING...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                CREATE ACCOUNT
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ 
          textAlign: 'center',
          padding: '15px 0 0',
          borderTop: '1px solid #e0e0e0'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>Already have an account? </span>
          <Link 
            to="/login" 
            style={{ 
              color: '#0066ff', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0052cc'}
            onMouseLeave={(e) => e.target.style.color = '#0066ff'}
          >
            Sign in here
          </Link>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link 
            to="/"
            style={{
              color: '#999',
              textDecoration: 'none',
              fontSize: '14px',
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

export default Register;
