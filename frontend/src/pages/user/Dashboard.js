import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReports, deleteReport } from '../../services/api';
import './UserDashboard.css';

// Helper function to get the correct image URL - UPDATED to use localhost
const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // If it's already a full URL, return it as is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Extract just the filename if it includes paths
  let filename = photoPath;
  if (photoPath.includes('/')) {
    filename = photoPath.split('/').pop();
  }
  
  // Use your computer's IP directly
  return `http://10.234.144.150:5000/static/uploads/${filename}`;
};

function UserDashboard() {
  // ========================================
  // State Management
  // ========================================
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  const navigate = useNavigate();

  // ========================================
  // Helper Functions
  // ========================================

  const getStatusBadge = useCallback((status) => {
    const colors = {
      Pending: { bg: '#ffaa00', text: '#000' },
      'In Progress': { bg: '#4361ee', text: '#fff' },
      Resolved: { bg: '#10b981', text: '#fff' }
    };
    const style = colors[status] || { bg: '#6c757d', text: '#fff' };
    
    return (
      <span 
        className={`status-badge ${isMobile ? 'mobile' : ''}`}
        style={{
          background: style.bg,
          color: style.text
        }}
      >
        {status}
      </span>
    );
  }, [isMobile]);

  const getPriorityBadge = useCallback((priority) => {
    const colors = {
      High: { bg: '#ff4444', text: '#fff' },
      Medium: { bg: '#ffaa00', text: '#000' },
      Low: { bg: '#10b981', text: '#fff' }
    };
    const style = colors[priority] || { bg: '#6c757d', text: '#fff' };
    
    return (
      <span 
        className={`priority-badge ${isMobile ? 'mobile' : ''}`}
        style={{
          background: style.bg,
          color: style.text
        }}
      >
        {priority}
      </span>
    );
  }, [isMobile]);

  // ========================================
  // Data Fetching
  // ========================================

  const fetchReports = useCallback(async () => {
  console.log('?? Fetching reports...');
  try {
    const res = await getReports();
    console.log('? API Response received:', res.data);

    let reportsData = [];
    if (Array.isArray(res.data)) {
      reportsData = res.data;
    } else if (res.data && Array.isArray(res.data.reports)) {
      reportsData = res.data.reports;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      reportsData = res.data.data;
    }

    console.log(`?? Found ${reportsData.length} reports`);
    setReports(reportsData);
    
    const total = reportsData.length;
    const pending = reportsData.filter(r => r.status === 'Pending').length;
    const inProgress = reportsData.filter(r => r.status === 'In Progress').length;
    const resolved = reportsData.filter(r => r.status === 'Resolved').length;

    setStats({ total, pending, inProgress, resolved });
    console.log('? Setting loading to false');
    setLoading(false);
  } catch (err) {
    console.error('? Error fetching reports:', err);

    if (err.response?.status === 401) {
      console.log('?? Unauthorized - redirecting to login');
      setIsAuthenticated(false);
    } else {
      setError('Failed to load reports');
    }
    setLoading(false);
  }
}, []);

  // ========================================
  // Event Handlers
  // ========================================

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    
    try {
      await deleteReport(id);
      const updatedReports = reports.filter(r => r.id !== id);
      setReports(updatedReports);
      
      const total = updatedReports.length;
      const pending = updatedReports.filter(r => r.status === 'Pending').length;
      const inProgress = updatedReports.filter(r => r.status === 'In Progress').length;
      const resolved = updatedReports.filter(r => r.status === 'Resolved').length;
      setStats({ total, pending, inProgress, resolved });
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleViewPhoto = (photoPath) => {
    if (photoPath) {
      setSelectedPhoto(photoPath);
      setShowPhotoModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // ========================================
  // Effects
  // ========================================

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      fetchReports();
    }
  }, [fetchReports]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========================================
  // Loading and Error States
  // ========================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className={`loading-card ${isMobile ? 'mobile' : ''}`}>
          <i className="bi bi-arrow-repeat loading-spinner"></i>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className={`error-card ${isMobile ? 'mobile' : ''}`}>
          <i className="bi bi-exclamation-triangle error-icon"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // ========================================
  // Render Components
  // ========================================

  return (
    <div className={`dashboard-container ${isMobile ? 'mobile' : ''}`}>
      <div className="background-pattern"></div>

      <div className="dashboard-content">
        {/* Header Section */}
        <header className={`dashboard-header ${isMobile ? 'mobile' : ''}`}>
          <div className={`header-title ${isMobile ? 'mobile' : ''}`}>
            <h1>
              <i className="bi bi-speedometer2"></i>
              My Dashboard
            </h1>
            <p>Track and manage your reports</p>
          </div>
          
        
        </header>

        {/* Statistics Cards */}
        <div className={`stats-grid ${isMobile ? 'mobile' : ''}`}>
          {[
            { label: 'Total', value: stats.total, color: '#4361ee', icon: 'bi-pie-chart' },
            { label: 'Pending', value: stats.pending, color: '#ffaa00', icon: 'bi-hourglass' },
            { label: 'Progress', value: stats.inProgress, color: '#4361ee', icon: 'bi-arrow-repeat' },
            { label: 'Resolved', value: stats.resolved, color: '#10b981', icon: 'bi-check-circle' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`stat-card ${isMobile ? 'mobile' : ''}`}
            >
              <i className={`bi ${stat.icon} stat-icon`} style={{ color: stat.color }}></i>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Reports Container */}
        <div className="reports-container">
          <div className={`reports-header ${isMobile ? 'mobile' : ''}`}>
            <h2>
              <i className="bi bi-list-check"></i>
              My Reports
            </h2>
          </div>

          {/* Mobile View - Cards Design */}
          {isMobile ? (
            <div className="mobile-view">
              {reports.length === 0 ? (
                <div className="empty-state-mobile">
                  <i className="bi bi-inbox empty-icon"></i>
                  <p>No reports yet</p>
                  <Link to="/report/new" className="create-report-btn">
                    <i className="bi bi-plus-circle"></i>
                    CREATE REPORT
                  </Link>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="mobile-report-card">
                    <div className="card-header">
                      <span className="room-chip">{report.room}</span>
                      <span className="card-id">#{report.id}</span>
                    </div>

                    <div className="card-details">
                      <div className="card-detail-item">
                        <i className="bi bi-tag" style={{ color: '#4361ee' }}></i>
                        <span>{report.report_type}</span>
                      </div>
                      <div className="card-detail-item">
                        <i className="bi bi-calendar" style={{ color: '#4361ee' }}></i>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="media-status">
                      <div>
                        {report.photo_path ? (
                          <img 
                            src={getImageUrl(report.photo_path)}
                            alt="Report"
                            className="mobile-photo"
                            onClick={() => handleViewPhoto(report.photo_path)}
                          />
                        ) : (
                          <div className="no-photo-placeholder">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="status-priority">
                        <div>{getStatusBadge(report.status)}</div>
                        <div>{getPriorityBadge(report.priority)}</div>
                      </div>
                    </div>

                    <div className="mobile-actions">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="mobile-view-btn"
                      >
                        <i className="bi bi-eye"></i>
                        VIEW
                      </button>
                      {report.status === 'Pending' && (
                        <button 
                          onClick={() => handleDelete(report.id)} 
                          className="mobile-delete-btn"
                        >
                          <i className="bi bi-trash"></i>
                          DELETE
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Desktop View - Table */
            <>
              <div className="table-header">
                <div><i className="bi bi-door-open"></i>Room</div>
                <div><i className="bi bi-hash"></i>ID</div>
                <div><i className="bi bi-tag"></i>Type</div>
                <div><i className="bi bi-calendar"></i>Date</div>
                <div><i className="bi bi-image"></i>Photo</div>
                <div><i className="bi bi-flag"></i>Status</div>
                <div><i className="bi bi-exclamation-triangle"></i>Priority</div>
                <div className="actions-header"><i className="bi bi-gear"></i>Actions</div>
              </div>

              <div className="table-content">
                {reports.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>No reports yet</p>
                  </div>
                ) : (
                  <div>
                    {reports.map((report) => (
                      <div key={report.id} className="table-row">
                        <div>
                          <span className="room-badge">{report.room}</span>
                        </div>
                        
                        <div className="report-id">#{report.id}</div>
                        
                        <div className="report-type">{report.report_type}</div>
                        
                        <div className="report-date">
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        
                        <div>
                          {report.photo_path ? (
                            <img 
                              src={getImageUrl(report.photo_path)}
                              alt="Report"
                              className="photo-thumbnail"
                              onClick={() => handleViewPhoto(report.photo_path)}
                            />
                          ) : (
                            <span className="no-photo">No photo</span>
                          )}
                        </div>
                        
                        <div>{getStatusBadge(report.status)}</div>
                        
                        <div>{getPriorityBadge(report.priority)}</div>
                        
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="view-btn"
                          >
                            <i className="bi bi-eye"></i>
                            VIEW
                          </button>
                          {report.status === 'Pending' && (
                            <button 
                              onClick={() => handleDelete(report.id)} 
                              className="delete-btn"
                            >
                              <i className="bi bi-trash"></i>
                              DELETE
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className={`modal-overlay ${isMobile ? 'mobile' : ''}`}>
          <div className={`modal-content ${isMobile ? 'mobile' : ''}`}>
            <div className={`modal-header ${isMobile ? 'mobile' : ''}`}>
              <div className="modal-title">
                <i className="bi bi-file-text" style={{ color: '#4361ee' }}></i>
                <h2>Report Details</h2>
              </div>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>

            <div className={`modal-body ${isMobile ? 'mobile' : ''}`}>
              {/* Report ID Card */}
              <div className={`report-id-card ${isMobile ? 'mobile' : ''}`}>
                <div className={`report-id-container ${isMobile ? 'mobile' : ''}`}>
                  <div>
                    <span className="report-id-label">Report ID</span>
                    <h3 className={`report-id-value ${isMobile ? 'mobile' : ''}`}>
                      #{selectedReport.id}
                    </h3>
                  </div>
                  <div className={`room-chip-large ${isMobile ? 'mobile' : ''}`}>
                    <i className="bi bi-door-open"></i>
                    <span>{selectedReport.room}</span>
                  </div>
                </div>
              </div>

              {/* Photo Section */}
              {selectedReport.photo_path && (
                <div className="photo-section">
                  <div className="photo-label">
                    <i className="bi bi-image" style={{ color: '#4361ee' }}></i>
                    <span>Attached Photo</span>
                  </div>
                  <img 
                    src={getImageUrl(selectedReport.photo_path)}
                    alt="Report"
                    className={`modal-photo ${isMobile ? 'mobile' : ''}`}
                    onClick={() => handleViewPhoto(selectedReport.photo_path)}
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className={`details-grid ${isMobile ? 'mobile' : ''}`}>
                {/* Type Card */}
                <div className={`detail-card ${isMobile ? 'mobile' : ''}`}>
                  <div className="detail-header">
                    <i className="bi bi-tag" style={{ color: '#4361ee' }}></i>
                    <span>Type</span>
                  </div>
                  <div className="detail-content">{selectedReport.report_type}</div>
                  <div className="detail-footer">
                    <i className="bi bi-person"></i> {selectedReport.author_name || 'Unknown'}
                  </div>
                </div>

                {/* Date Card */}
                <div className={`detail-card ${isMobile ? 'mobile' : ''}`}>
                  <div className="detail-header">
                    <i className="bi bi-calendar" style={{ color: '#4361ee' }}></i>
                    <span>Date</span>
                  </div>
                  <div className="detail-content">
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </div>
                  <div className="detail-footer">
                    <i className="bi bi-clock"></i> {new Date(selectedReport.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Priority Card */}
                <div className={`detail-card ${isMobile ? 'mobile' : ''}`}>
                  <div className="detail-header">
                    <i className="bi bi-flag" style={{ color: '#4361ee' }}></i>
                    <span>Priority</span>
                  </div>
                  <div className="detail-content">
                    {getPriorityBadge(selectedReport.priority)}
                  </div>
                </div>

                {/* Status Card */}
                <div className={`detail-card ${isMobile ? 'mobile' : ''}`}>
                  <div className="detail-header">
                    <i className="bi bi-check-circle" style={{ color: '#4361ee' }}></i>
                    <span>Status</span>
                  </div>
                  <div className="detail-content">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className={`description-section ${isMobile ? 'mobile' : ''}`}>
                <div className="description-header">
                  <i className="bi bi-chat-dots" style={{ color: '#4361ee' }}></i>
                  <span>Description</span>
                </div>
                <div className={`description-content ${isMobile ? 'mobile' : ''}`}>
                  {selectedReport.description || 'No description provided'}
                </div>
              </div>
            </div>

            <div className={`modal-footer ${isMobile ? 'mobile' : ''}`}>
              <button onClick={closeModal} className={`close-btn ${isMobile ? 'mobile' : ''}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className={`photo-modal-overlay ${isMobile ? 'mobile' : ''}`} onClick={closePhotoModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(selectedPhoto)}
              alt="Report full size"
              className={`fullsize-photo ${isMobile ? 'mobile' : ''}`}
            />
            <button
              onClick={closePhotoModal}
              className={`photo-close-btn ${isMobile ? 'mobile' : ''}`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;



