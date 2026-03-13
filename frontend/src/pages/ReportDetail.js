import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReports, updateReport } from '../services/api';

// Helper function for images
const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // Extract filename if it contains paths
  let filename = photoPath;
  if (photoPath.includes('\\')) {
    filename = photoPath.split('\\').pop();
  } else if (photoPath.includes('/')) {
    filename = photoPath.split('/').pop();
  }
  
  return `http://localhost:5000/static/uploads/${filename}`;
};

function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await getReports();
      const foundReport = response.data.find(r => r.id === parseInt(id));
      
      if (foundReport) {
        // Check if user has permission to view this report
        if (user.role !== 'admin' && foundReport.user_id !== user.id) {
          setError('You do not have permission to view this report');
          setReport(null);
        } else {
          setReport(foundReport);
        }
      } else {
        setError('Report not found');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateReport(id, { status: newStatus });
      setReport({ ...report, status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: { bg: '#ffaa00', text: '#000' },
      'In Progress': { bg: '#4361ee', text: '#fff' },
      Resolved: { bg: '#10b981', text: '#fff' }
    };
    const style = colors[status] || { bg: '#6c757d', text: '#fff' };
    
    return (
      <span style={{
        background: style.bg,
        color: style.text,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      High: { bg: '#ff4444', text: '#fff' },
      Medium: { bg: '#ffaa00', text: '#000' },
      Low: { bg: '#10b981', text: '#fff' }
    };
    const style = colors[priority] || { bg: '#6c757d', text: '#fff' };
    
    return (
      <span style={{
        background: style.bg,
        color: style.text,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        marginLeft: '8px'
      }}>
        {priority}
      </span>
    );
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
        Loading report details...
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error) return (
    <div style={{ 
      background: '#f5f7fb', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
        color: '#ff4444'
      }}>
        <i className="bi bi-exclamation-triangle" style={{ fontSize: '40px', display: 'block', marginBottom: '15px', color: '#ff4444' }}></i>
        <p>{error}</p>
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin/reports' : '/dashboard')}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!report) return (
    <div style={{ 
      background: '#f5f7fb', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <i className="bi bi-inbox" style={{ fontSize: '40px', display: 'block', marginBottom: '15px', color: '#e9ecef' }}></i>
        <p>Report not found</p>
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin/reports' : '/dashboard')}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // Double-check permission
  if (user.role !== 'admin' && report.user_id !== user.id) {
    return (
      <div style={{ 
        background: '#f5f7fb', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#ff4444'
        }}>
          <i className="bi bi-shield-lock" style={{ fontSize: '40px', display: 'block', marginBottom: '15px', color: '#ff4444' }}></i>
          <p>You do not have permission to view this report</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user && user.role === 'admin';

  return (
    <div style={{
      background: '#f5f7fb',
      minHeight: '100vh',
      padding: isMobile ? '20px 10px 80px 10px' : '30px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
              <i className="bi bi-file-text" style={{ color: '#4361ee', marginRight: '10px' }}></i>
              Report #{report.id}
            </h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
              View detailed information about this report
            </p>
          </div>
          
          <Link 
            to={isAdmin ? '/admin/reports' : '/dashboard'} 
            style={{
              padding: '10px 24px',
              background: 'white',
              color: '#6c757d',
              border: '1px solid #e9ecef',
              borderRadius: '30px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#4361ee';
              e.target.style.color = '#4361ee';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#e9ecef';
              e.target.style.color = '#6c757d';
            }}
          >
            <i className="bi bi-arrow-left"></i>
            Back to {isAdmin ? 'Reports' : 'Dashboard'}
          </Link>
        </div>

        {/* Main Report Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          marginBottom: '30px'
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
              <i className="bi bi-info-circle" style={{ color: '#4361ee' }}></i>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
              Report Information
            </h3>
          </div>
          
          <div style={{ padding: isMobile ? '20px' : '30px' }}>
            {/* Title */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '15px 20px',
              marginBottom: '25px'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a1a2c'
              }}>
                {report.title}
              </h2>
            </div>

            {/* Two Column Layout for Details */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '20px', 
              marginBottom: '25px' 
            }}>
              {/* Left Column */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-tag" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Type</span>
                  </div>
                  <div style={{ color: '#1a1a2c', fontSize: '15px', fontWeight: '500', marginLeft: '22px' }}>
                    {report.report_type}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-door-open" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Room</span>
                  </div>
                  <div style={{ color: '#1a1a2c', fontSize: '15px', fontWeight: '500', marginLeft: '22px' }}>
                    {report.room}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-flag" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Priority</span>
                  </div>
                  <div style={{ marginLeft: '22px' }}>
                    {getPriorityBadge(report.priority)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-check-circle" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Status</span>
                  </div>
                  <div style={{ marginLeft: '22px' }}>
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-person" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Reported by</span>
                  </div>
                  <div style={{ color: '#1a1a2c', fontSize: '15px', fontWeight: '500', marginLeft: '22px' }}>
                    {report.author_name}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <i className="bi bi-calendar" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                    <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Created</span>
                  </div>
                  <div style={{ color: '#1a1a2c', fontSize: '14px', marginLeft: '22px' }}>
                    {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>

                {report.submitted_date && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <i className="bi bi-clock" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                      <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Submitted</span>
                    </div>
                    <div style={{ color: '#1a1a2c', fontSize: '14px', marginLeft: '22px' }}>
                      {new Date(report.submitted_date).toLocaleString()}
                    </div>
                  </div>
                )}

                {report.in_progress_date && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <i className="bi bi-arrow-repeat" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                      <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>In Progress</span>
                    </div>
                    <div style={{ color: '#1a1a2c', fontSize: '14px', marginLeft: '22px' }}>
                      {new Date(report.in_progress_date).toLocaleString()}
                    </div>
                  </div>
                )}

                {report.resolved_date && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <i className="bi bi-check-circle" style={{ color: '#4361ee', fontSize: '14px' }}></i>
                      <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Resolved</span>
                    </div>
                    <div style={{ color: '#1a1a2c', fontSize: '14px', marginLeft: '22px' }}>
                      {new Date(report.resolved_date).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <i className="bi bi-chat-dots" style={{ color: '#4361ee', fontSize: '16px' }}></i>
                <span style={{ color: '#1a1a2c', fontSize: '14px', fontWeight: '600' }}>Description</span>
              </div>
              <p style={{ color: '#1a1a2c', fontSize: '14px', lineHeight: '1.6', margin: 0, marginLeft: '24px' }}>
                {report.description}
              </p>
            </div>

            {/* Photo */}
            {report.photo_path && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  <i className="bi bi-image" style={{ color: '#4361ee', fontSize: '16px' }}></i>
                  <span style={{ color: '#1a1a2c', fontSize: '14px', fontWeight: '600' }}>Attached Photo</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={getImageUrl(report.photo_path)}
                    alt="Report"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '2px solid #e9ecef'
                    }}
                    onClick={() => window.open(getImageUrl(report.photo_path), '_blank')}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <p style={{ color: '#6c757d', fontSize: '13px', marginTop: '10px' }}>
                    <i className="bi bi-zoom-in"></i> Click image to view full size
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '15px 20px', 
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,170,0,0.05)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,170,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-shield" style={{ color: '#ffaa00' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
                Admin Actions
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '15px', fontWeight: '500' }}>
                Update Report Status:
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => handleStatusChange('Pending')}
                  disabled={report.status === 'Pending'}
                  style={{
                    padding: '10px 20px',
                    background: report.status === 'Pending' ? '#ffaa00' : 'white',
                    color: report.status === 'Pending' ? 'white' : '#ffaa00',
                    border: report.status === 'Pending' ? 'none' : '2px solid #ffaa00',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: report.status === 'Pending' ? 'not-allowed' : 'pointer',
                    opacity: report.status === 'Pending' ? 0.7 : 1,
                    transition: 'all 0.2s',
                    flex: isMobile ? '1' : '0 1 auto'
                  }}
                  onMouseEnter={(e) => {
                    if (report.status !== 'Pending') {
                      e.target.style.background = '#ffaa00';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (report.status !== 'Pending') {
                      e.target.style.background = 'white';
                      e.target.style.color = '#ffaa00';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  Pending
                </button>
                
                <button 
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={report.status === 'In Progress'}
                  style={{
                    padding: '10px 20px',
                    background: report.status === 'In Progress' ? '#4361ee' : 'white',
                    color: report.status === 'In Progress' ? 'white' : '#4361ee',
                    border: report.status === 'In Progress' ? 'none' : '2px solid #4361ee',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: report.status === 'In Progress' ? 'not-allowed' : 'pointer',
                    opacity: report.status === 'In Progress' ? 0.7 : 1,
                    transition: 'all 0.2s',
                    flex: isMobile ? '1' : '0 1 auto'
                  }}
                  onMouseEnter={(e) => {
                    if (report.status !== 'In Progress') {
                      e.target.style.background = '#4361ee';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (report.status !== 'In Progress') {
                      e.target.style.background = 'white';
                      e.target.style.color = '#4361ee';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  In Progress
                </button>
                
                <button 
                  onClick={() => handleStatusChange('Resolved')}
                  disabled={report.status === 'Resolved'}
                  style={{
                    padding: '10px 20px',
                    background: report.status === 'Resolved' ? '#10b981' : 'white',
                    color: report.status === 'Resolved' ? 'white' : '#10b981',
                    border: report.status === 'Resolved' ? 'none' : '2px solid #10b981',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: report.status === 'Resolved' ? 'not-allowed' : 'pointer',
                    opacity: report.status === 'Resolved' ? 0.7 : 1,
                    transition: 'all 0.2s',
                    flex: isMobile ? '1' : '0 1 auto'
                  }}
                  onMouseEnter={(e) => {
                    if (report.status !== 'Resolved') {
                      e.target.style.background = '#10b981';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (report.status !== 'Resolved') {
                      e.target.style.background = 'white';
                      e.target.style.color = '#10b981';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDetail;