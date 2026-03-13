import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatistics, getUsers, getReports } from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        getStatistics(),
        getUsers(),
        getReports()
      ]);

      const byStatus = statsRes.data.by_status.reduce((acc, s) => {
        if (s.status === 'Pending') acc.pending = s.count;
        else if (s.status === 'In Progress') acc.inProgress = s.count;
        else if (s.status === 'Resolved') acc.resolved = s.count;
        return acc;
      }, {});

      const totalUsers = usersRes.data.length;
      const pendingApprovals = usersRes.data.filter(u => !u.is_active && u.role !== 'admin').length;

      setStats({
        total: statsRes.data.total,
        pending: byStatus.pending || 0,
        inProgress: byStatus.inProgress || 0,
        resolved: byStatus.resolved || 0,
        totalUsers,
        pendingApprovals
      });

      const bsitCount = usersRes.data.filter(u => u.department === 'BSIT' && u.is_active).length;
      const bsoaCount = usersRes.data.filter(u => u.department === 'BSOA' && u.is_active).length;

      setCourses([
        { id: 'BSIT', name: 'Information Technology', students: bsitCount },
        { id: 'BSOA', name: 'Office Administration', students: bsoaCount }
      ]);

      // Get reports data
      let reportsData = [];
      if (Array.isArray(reportsRes.data)) {
        reportsData = reportsRes.data;
      } else if (reportsRes.data && Array.isArray(reportsRes.data.reports)) {
        reportsData = reportsRes.data.reports;
      } else if (reportsRes.data && reportsRes.data.data && Array.isArray(reportsRes.data.data)) {
        reportsData = reportsRes.data.data;
      }

      const sortedReports = reportsData.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);
      
      setRecentReports(sortedReports);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
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

  // Helper function to extract filename
  const getFilename = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.includes('\\')) {
      return photoPath.split('\\').pop();
    } else if (photoPath.includes('/')) {
      return photoPath.split('/').pop();
    }
    return photoPath;
  };

  const handleViewPhoto = (photoPath) => {
    if (photoPath) {
      const filename = getFilename(photoPath);
      setSelectedPhoto(`/static/uploads/${filename}`);
      setShowPhotoModal(true);
    }
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Calculate percentage changes (mock data for demo)
  const getPercentageChange = (value) => {
    const changes = {
      total: '+12.5',
      pending: '-3.1',
      inProgress: '+8.2',
      resolved: '+24.7',
      totalUsers: '+5.3',
      pendingApprovals: '-2.1'
    };
    return changes;
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
        Loading dashboard...
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const changes = getPercentageChange();

  return (
    <div style={{
      background: '#f5f7fb',
      minHeight: '100vh',
      padding: isMobile ? '20px 10px 80px 10px' : '30px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              Welcome back, Admin
            </h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
              Here's what's happening with your campus reports today.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>         
            {/* User Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              AD
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          {/* Total Reports */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>Total Reports</div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(67,97,238,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-file-text" style={{ color: '#4361ee' }}></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2c', marginBottom: '5px' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '13px', color: '#10b981' }}>
              <i className="bi bi-arrow-up"></i> {changes.total}% vs last month
            </div>
          </div>

          {/* Pending */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>Pending</div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,170,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-hourglass" style={{ color: '#ffaa00' }}></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2c', marginBottom: '5px' }}>
              {stats.pending}
            </div>
            <div style={{ fontSize: '13px', color: '#ef4444' }}>
              <i className="bi bi-arrow-down"></i> {changes.pending}% vs last month
            </div>
          </div>

          {/* In Progress */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>In Progress</div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(67,97,238,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-arrow-repeat" style={{ color: '#4361ee' }}></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2c', marginBottom: '5px' }}>
              {stats.inProgress}
            </div>
            <div style={{ fontSize: '13px', color: '#10b981' }}>
              <i className="bi bi-arrow-up"></i> {changes.inProgress}% vs last month
            </div>
          </div>

          {/* Resolved */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>Resolved</div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-check-circle" style={{ color: '#10b981' }}></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2c', marginBottom: '5px' }}>
              {stats.resolved}
            </div>
            <div style={{ fontSize: '13px', color: '#10b981' }}>
              <i className="bi bi-arrow-up"></i> {changes.resolved}% vs last month
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          {/* Left Column - Reports Overview */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
                Reports Overview
              </h3>
              <select style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #e9ecef',
                fontSize: '13px',
                color: '#6c757d',
                background: 'white'
              }}>
                <option>This Year</option>
                <option>This Month</option>
                <option>This Week</option>
              </select>
            </div>

            {/* Bar Chart */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '80px', fontSize: '13px', color: '#6c757d' }}>Pending</div>
                <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px' }}>
                  <div style={{ width: `${(stats.pending / stats.total) * 100}%`, height: '100%', background: '#ffaa00', borderRadius: '4px' }}></div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2c' }}>{stats.pending}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '80px', fontSize: '13px', color: '#6c757d' }}>In Progress</div>
                <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px' }}>
                  <div style={{ width: `${(stats.inProgress / stats.total) * 100}%`, height: '100%', background: '#4361ee', borderRadius: '4px' }}></div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2c' }}>{stats.inProgress}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '80px', fontSize: '13px', color: '#6c757d' }}>Resolved</div>
                <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px' }}>
                  <div style={{ width: `${(stats.resolved / stats.total) * 100}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2c' }}>{stats.resolved}</div>
              </div>
            </div>

            {/* Course Enrollment */}
            <h3 style={{ margin: '20px 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
              Course Enrollment
            </h3>
            {courses.map(course => (
              <div key={course.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', color: '#1a1a2c' }}>{course.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#4361ee' }}>{course.students} students</span>
                </div>
                <div style={{ height: '6px', background: '#e9ecef', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${(course.students / stats.totalUsers) * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                    borderRadius: '3px' 
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Users & Traffic */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
              User Statistics
            </h3>

            {/* Total Users Card */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Active Users</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2c' }}>{stats.totalUsers}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#10b981' }}>
                  <i className="bi bi-arrow-up"></i> {changes.totalUsers}% vs last month
                </span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>Total registered</span>
              </div>
            </div>

            {/* Pending Approvals */}
            <div style={{
              background: stats.pendingApprovals > 0 ? '#fff3cd' : '#f8f9fa',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', color: stats.pendingApprovals > 0 ? '#856404' : '#6c757d' }}>
                  Pending Approvals
                </span>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: stats.pendingApprovals > 0 ? '#856404' : '#1a1a2c' 
                }}>
                  {stats.pendingApprovals}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>
                  <i className="bi bi-arrow-down"></i> {changes.pendingApprovals}% vs last month
                </span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>Awaiting activation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports with Photos - USING RELATIVE PATHS */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
              Recent Reports
            </h3>
            <Link to="/admin/reports" style={{ color: '#4361ee', textDecoration: 'none', fontSize: '14px' }}>
              View All →
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>No reports yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Photo</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Reporter</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Room</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '500' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(report => {
                    const filename = getFilename(report.photo_path);
                    
                    return (
                      <tr key={report.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '12px' }}>
                          {report.photo_path ? (
                            <img 
                              src={`/static/uploads/${filename}`}
                              alt="Report"
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: '2px solid #4361ee',
                                boxShadow: '0 2px 4px rgba(67,97,238,0.2)'
                              }}
                              onClick={() => handleViewPhoto(report.photo_path)}
                              onError={(e) => {
                                console.log('Failed to load:', e.target.src);
                                e.target.style.display = 'none';
                                const parent = e.target.parentNode;
                                const fallback = document.createElement('div');
                                fallback.style.width = '60px';
                                fallback.style.height = '60px';
                                fallback.style.borderRadius = '8px';
                                fallback.style.background = '#ffebee';
                                fallback.style.display = 'flex';
                                fallback.style.alignItems = 'center';
                                fallback.style.justifyContent = 'center';
                                fallback.style.color = '#c62828';
                                fallback.style.fontSize = '11px';
                                fallback.style.border = '1px solid #ef9a9a';
                                fallback.innerText = 'Failed';
                                parent.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              background: '#f8f9fa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6c757d',
                              fontSize: '11px',
                              border: '1px dashed #e9ecef'
                            }}>
                              No photo
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <Link to={`/report/${report.id}`} style={{ color: '#4361ee', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                            {report.title}
                          </Link>
                        </td>
                        <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{report.author_name}</td>
                        <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{report.room}</td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(report.status)}</td>
                        <td style={{ padding: '12px', color: '#6c757d', fontSize: '13px' }}>
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '20px'
        }} onClick={closePhotoModal}>
          <div style={{ position: 'relative', maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto}
              alt="Report full size"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              onError={(e) => {
                console.log('Modal image failed to load:', e.target.src);
              }}
            />
            <button
              onClick={closePhotoModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: '#ff4444',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,68,68,0.3)'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;