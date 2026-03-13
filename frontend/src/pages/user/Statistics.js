import React, { useEffect, useState } from 'react';
import { getPublicStatistics } from '../../services/api'; // Change this import!

function UserStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [timeRange, setTimeRange] = useState('year');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      // Use the new public statistics endpoint
      const res = await getPublicStatistics();
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
      setLoading(false);
    }
  };

  // Calculate percentages
  const total = stats?.total || 0;
  const byType = stats?.by_type || [];
  const byRoom = stats?.by_room || [];
  const byStatus = stats?.by_status || [];

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#ffaa00',
      'In Progress': '#4361ee',
      Resolved: '#10b981'
    };
    return colors[status] || '#6c757d';
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
        Loading statistics...
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
      </div>
    </div>
  );

  if (!stats) return (
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
        <i className="bi bi-bar-chart" style={{ fontSize: '40px', display: 'block', marginBottom: '15px', color: '#e9ecef' }}></i>
        <p>No statistics data available</p>
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#f5f7fb',
      minHeight: '100vh',
      padding: isMobile ? '20px 10px 80px 10px' : '30px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Time Range Selector */}
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
              <i className="bi bi-graph-up" style={{ color: '#4361ee', marginRight: '10px' }}></i>
              Campus Statistics
            </h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
              Overview of all campus reports and analytics
            </p>
          </div>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '30px',
              color: '#1a1a2c',
              fontSize: '14px',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Total Reports Card - Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          borderRadius: '24px',
          padding: isMobile ? '30px 20px' : '40px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 20px 30px rgba(67,97,238,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>
              <i className="bi bi-clipboard-data" style={{ marginRight: '8px' }}></i>
              Total Campus Reports
            </div>
            <div style={{ color: 'white', fontSize: isMobile ? '48px' : '64px', fontWeight: '700', lineHeight: 1, marginBottom: '10px' }}>
              {total}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              Across all rooms and types
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
          gap: '20px' 
        }}>
          {/* Reports by Type */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transition: 'transform 0.2s'
          }}>
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
                <i className="bi bi-tag" style={{ color: '#4361ee' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
                Reports by Type
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              {byType.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', color: '#e9ecef' }}></i>
                  <p>No type data available</p>
                </div>
              ) : (
                byType.map(item => {
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.type} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px' 
                      }}>
                        <span style={{ 
                          color: '#1a1a2c', 
                          fontSize: '14px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {item.type}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: '#4361ee', fontWeight: '600', fontSize: '16px' }}>
                            {item.count}
                          </span>
                          <span style={{ 
                            background: '#f8f9fa', 
                            padding: '2px 8px', 
                            borderRadius: '20px',
                            color: '#6c757d',
                            fontSize: '12px'
                          }}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reports by Room */}
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
                <i className="bi bi-door-open" style={{ color: '#4361ee' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
                Reports by Room
              </h3>
            </div>
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {byRoom.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', color: '#e9ecef' }}></i>
                  <p>No room data available</p>
                </div>
              ) : (
                byRoom.map(item => {
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.room} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px' 
                      }}>
                        <span style={{ color: '#1a1a2c', fontSize: '14px', fontWeight: '500' }}>
                          {item.room}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: '#4361ee', fontWeight: '600', fontSize: '16px' }}>
                            {item.count}
                          </span>
                          <span style={{ 
                            background: '#f8f9fa', 
                            padding: '2px 8px', 
                            borderRadius: '20px',
                            color: '#6c757d',
                            fontSize: '12px'
                          }}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reports by Status */}
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
                <i className="bi bi-check-circle" style={{ color: '#4361ee' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2c' }}>
                Reports by Status
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              {byStatus.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', color: '#e9ecef' }}></i>
                  <p>No status data available</p>
                </div>
              ) : (
                byStatus.map(item => {
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const statusColor = getStatusColor(item.status);
                  return (
                    <div key={item.status} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px' 
                      }}>
                        <span style={{ color: '#1a1a2c', fontSize: '14px', fontWeight: '500' }}>
                          {item.status}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: statusColor, fontWeight: '600', fontSize: '16px' }}>
                            {item.count}
                          </span>
                          <span style={{ 
                            background: '#f8f9fa', 
                            padding: '2px 8px', 
                            borderRadius: '20px',
                            color: '#6c757d',
                            fontSize: '12px'
                          }}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: statusColor,
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: '20px', 
          marginTop: '30px' 
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,170,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-hourglass" style={{ color: '#ffaa00', fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '5px' }}>Pending</div>
              <div style={{ color: '#1a1a2c', fontSize: '24px', fontWeight: '700' }}>
                {byStatus.find(s => s.status === 'Pending')?.count || 0}
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(67,97,238,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-arrow-repeat" style={{ color: '#4361ee', fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '5px' }}>In Progress</div>
              <div style={{ color: '#1a1a2c', fontSize: '24px', fontWeight: '700' }}>
                {byStatus.find(s => s.status === 'In Progress')?.count || 0}
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16,185,129,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-check-circle" style={{ color: '#10b981', fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '5px' }}>Resolved</div>
              <div style={{ color: '#1a1a2c', fontSize: '24px', fontWeight: '700' }}>
                {byStatus.find(s => s.status === 'Resolved')?.count || 0}
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(108,117,125,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-tag" style={{ color: '#6c757d', fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '5px' }}>Types</div>
              <div style={{ color: '#1a1a2c', fontSize: '24px', fontWeight: '700' }}>
                {byType.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatistics;