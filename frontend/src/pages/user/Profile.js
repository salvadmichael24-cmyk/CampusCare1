import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: 'BSIT',
    block: '1'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUserData = async () => {
    try {
      const userRes = await getCurrentUser();
      const userData = userRes.data.user || userRes.data;
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        department: userData.department || 'BSIT',
        block: userData.block || '1'
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await updateProfile(formData);
      setUser(response.data.user);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : '?';
  };

  if (loading) return (
    <div style={{ 
      background: '#f5f7fb', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{ color: '#1a1a2c', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: '30px', animation: 'spin 1s infinite linear', display: 'block', marginBottom: '15px', color: '#4361ee' }}></i>
        Loading profile...
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
      background: '#f5f7fb',
      minHeight: '100vh',
      padding: isMobile ? '20px 10px 80px 10px' : '30px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ 
              color: '#1a1a2c', 
              fontSize: isMobile ? '24px' : '28px', 
              margin: '0 0 5px 0',
              fontWeight: '700'
            }}>
              <i className="bi bi-person-circle" style={{ color: '#4361ee', marginRight: '10px' }}></i>
              My Profile
            </h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
              Manage your personal information
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #c3e6cb'
          }}>
            <i className="bi bi-check-circle-fill"></i>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #f5c6cb'
          }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{ 
            padding: '15px 20px', 
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1a1a2c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-person-badge" style={{ color: '#4361ee' }}></i>
              Profile Information
            </h3>
            
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                style={{
                  background: '#4361ee',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#3a56d4';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#4361ee';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-pencil"></i> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => setEditMode(false)} 
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <i className="bi bi-x-lg"></i> Cancel
              </button>
            )}
          </div>

          <div style={{ padding: isMobile ? '20px' : '30px' }}>
            {/* Profile Avatar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: '700',
                marginBottom: '15px',
                boxShadow: '0 10px 20px rgba(67,97,238,0.2)'
              }}>
                {getUserInitials()}
              </div>
              {!editMode && (
                <>
                  <h2 style={{ 
                    margin: '0 0 5px 0', 
                    color: '#1a1a2c', 
                    fontSize: '24px',
                    fontWeight: '700'
                  }}>
                    {user.first_name} {user.last_name}
                  </h2>
                  <p style={{ 
                    margin: 0, 
                    color: '#6c757d', 
                    fontSize: '14px',
                    background: '#f8f9fa',
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    @{user.username}
                  </p>
                </>
              )}
            </div>

            {!editMode ? (
              /* View Mode */
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ color: '#6c757d', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-envelope" style={{ color: '#4361ee' }}></i>
                    Email:
                  </div>
                  <div style={{ color: '#1a1a2c' }}>{user.email}</div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ color: '#6c757d', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-building" style={{ color: '#4361ee' }}></i>
                    Department:
                  </div>
                  <div style={{ color: '#1a1a2c' }}>{user.department}</div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ color: '#6c757d', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-grid-3x3" style={{ color: '#4361ee' }}></i>
                    Block:
                  </div>
                  <div style={{ color: '#1a1a2c' }}>{user.block}</div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ color: '#6c757d', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-shield" style={{ color: '#4361ee' }}></i>
                    Role:
                  </div>
                  <div>
                    <span style={{
                      background: user.role === 'admin' ? '#ff4444' : '#4361ee',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '120px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  padding: '10px'
                }}>
                  <div style={{ color: '#6c757d', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-calendar" style={{ color: '#4361ee' }}></i>
                    Member Since:
                  </div>
                  <div style={{ color: '#1a1a2c' }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit}>
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  {/* First Name */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      color: '#1a1a2c', 
                      fontSize: '14px', 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-person" style={{ color: '#4361ee' }}></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4361ee';
                        e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Last Name */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      color: '#1a1a2c', 
                      fontSize: '14px', 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-person" style={{ color: '#4361ee' }}></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4361ee';
                        e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      color: '#1a1a2c', 
                      fontSize: '14px', 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-envelope" style={{ color: '#4361ee' }}></i>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4361ee';
                        e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Department */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      color: '#1a1a2c', 
                      fontSize: '14px', 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-building" style={{ color: '#4361ee' }}></i>
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option>BSIT</option>
                      <option>BSOA</option>
                    </select>
                  </div>

                  {/* Block */}
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ 
                      color: '#1a1a2c', 
                      fontSize: '14px', 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-grid-3x3" style={{ color: '#4361ee' }}></i>
                      Block
                    </label>
                    <select
                      value={formData.block}
                      onChange={(e) => setFormData({...formData, block: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>

                  {/* Save Button */}
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#4361ee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {saving ? (
                      <>
                        <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;