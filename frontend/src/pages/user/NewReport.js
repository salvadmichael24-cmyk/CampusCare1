import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createReport } from '../../services/api';

function NewReport() {
  const [form, setForm] = useState({
    description: '',
    report_type: 'vandalism',
    room: 'CL01',
    priority: 'Medium'
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create photo preview when file is selected
  useEffect(() => {
    if (photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(photo);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('description', form.description);
    formData.append('report_type', form.report_type);
    formData.append('room', form.room);
    formData.append('priority', form.priority);
    formData.append('user_id', user.id);
    
    if (photo) formData.append('photo', photo);

    try {
      console.log('Submitting report...');
      const response = await createReport(formData);
      console.log('Success:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to create report';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
        Creating your report...
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
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            color: '#1a1a2c', 
            fontSize: isMobile ? '24px' : '28px', 
            margin: '0 0 5px 0',
            fontWeight: '700'
          }}>
            <i className="bi bi-plus-circle" style={{ color: '#4361ee', marginRight: '10px' }}></i>
            Create Report
          </h1>
          <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
            Submit a new issue or concern
          </p>
        </div>

        {/* Main Card */}
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
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(67,97,238,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-file-text" style={{ color: '#4361ee' }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
              Report Details
            </h3>
          </div>
          
          <div style={{ padding: isMobile ? '20px' : '30px' }}>
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
                border: '1px solid #f5c6cb',
                fontSize: '14px'
              }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#721c24' }}></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Type and Room in 2 columns */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '20px', 
                marginBottom: '20px' 
              }}>
                <div>
                  <label style={{ 
                    color: '#1a1a2c', 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="bi bi-tag" style={{ color: '#4361ee' }}></i>
                    Type
                  </label>
                  <select
                    value={form.report_type}
                    onChange={(e) => setForm({...form, report_type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      color: '#1a1a2c',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4361ee';
                      e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="vandalism">Vandalism</option>
                    <option value="waste">Waste</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    color: '#1a1a2c', 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="bi bi-door-open" style={{ color: '#4361ee' }}></i>
                    Room
                  </label>
                  <select
                    value={form.room}
                    onChange={(e) => setForm({...form, room: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      color: '#1a1a2c',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4361ee';
                      e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="CL01">CL01</option>
                    <option value="CL02">CL02</option>
                    <option value="CL03">CL03</option>
                    <option value="CL04">CL04</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  color: '#1a1a2c', 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="bi bi-flag" style={{ color: '#4361ee' }}></i>
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    color: '#1a1a2c',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4361ee';
                    e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  color: '#1a1a2c', 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="bi bi-chat-dots" style={{ color: '#4361ee' }}></i>
                  Description
                </label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  required
                  placeholder="Describe the issue in detail..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    color: '#1a1a2c',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none',
                    fontFamily: 'inherit'
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

              {/* Photo Upload */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                  color: '#1a1a2c', 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="bi bi-camera" style={{ color: '#4361ee' }}></i>
                  Photo (optional)
                </label>
                
                {photoPreview ? (
                  <div style={{
                    position: 'relative',
                    marginBottom: '10px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #4361ee'
                  }}>
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ff6666';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ff4444';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed #e9ecef',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4361ee';
                    e.currentTarget.style.background = '#f0f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.background = '#f8f9fa';
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#1a1a2c',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                    <p style={{ color: '#6c757d', fontSize: '13px', margin: '10px 0 0 0' }}>
                      <i className="bi bi-cloud-upload" style={{ marginRight: '5px', color: '#4361ee' }}></i>
                      Click to upload or drag and drop
                    </p>
                    <p style={{ color: '#adb5bd', fontSize: '11px', margin: '5px 0 0 0' }}>
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                flexDirection: isMobile ? 'column' : 'row' 
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#4361ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(67,97,238,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = '#3a56d4';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 16px rgba(67,97,238,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = '#4361ee';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(67,97,238,0.2)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s infinite linear' }}></i>
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      SUBMIT REPORT
                    </>
                  )}
                </button>
                
                <Link
                  to="/dashboard"
                  style={{
                    padding: '14px 24px',
                    background: 'white',
                    color: '#6c757d',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.borderColor = '#4361ee';
                    e.target.style.color = '#4361ee';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.color = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default NewReport;