import React, { useEffect, useState } from 'react';
import { getUsers, toggleUser } from '../../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Filter users whenever search term changes
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term) ||
        user.block?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleUser(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle user');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: '#ff4444', text: '#fff' },
      user: { bg: '#4361ee', text: '#fff' }
    };
    const style = colors[role] || { bg: '#6c757d', text: '#fff' };
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
        {role}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span style={{
        background: isActive ? '#10b981' : '#6c757d',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block'
      }}>
        {isActive ? 'Active' : 'Inactive'}
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
        Loading users...
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
        <i className="bi bi-exclamation-triangle" style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}></i>
        <p>{error}</p>
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
              <i className="bi bi-people" style={{ color: '#4361ee', marginRight: '10px' }}></i>
              Manage Users
            </h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
              View and manage all system users
            </p>
          </div>
    
        </div>

        {/* Search Bar Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '15px 20px', 
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="bi bi-search" style={{ color: '#4361ee' }}></i>
            <span style={{ fontWeight: '600', color: '#1a1a2c' }}>Search Users</span>
          </div>
          
          <div style={{
            padding: '20px',
            background: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '4px 4px 4px 16px',
              border: '1px solid #e9ecef'
            }}>
              <i className="bi bi-search" style={{ color: '#adb5bd' }}></i>
              <input
                type="text"
                placeholder="Search by username, name, email, department, block, or role..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#1a1a2c',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#adb5bd',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0 16px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4361ee'}
                  onMouseLeave={(e) => e.target.style.color = '#adb5bd'}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              )}
            </div>
          </div>
          
          <div style={{
            padding: '12px 20px',
            background: '#f8f9fa',
            borderTop: '1px solid #e9ecef',
            color: '#6c757d',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              <i className="bi bi-people" style={{ marginRight: '5px', color: '#4361ee' }}></i>
              Total: <strong>{users.length}</strong> users
            </span>
            <span>
              <i className="bi bi-filter" style={{ marginRight: '5px', color: '#4361ee' }}></i>
              Showing: <strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>

        {/* Users Table Card */}
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
              <i className="bi bi-table" style={{ color: '#4361ee' }}></i>
              All Users
            </h3>
            <span style={{
              background: '#f8f9fa',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#4361ee',
              fontWeight: '600'
            }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>
          
          <div style={{ padding: '20px', overflowX: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#6c757d'
              }}>
                <i className="bi bi-search" style={{ fontSize: '48px', display: 'block', marginBottom: '15px', color: '#e9ecef' }}></i>
                <p>No users found matching "<strong>{searchTerm}</strong>"</p>
                <button
                  onClick={clearSearch}
                  style={{
                    background: '#4361ee',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginTop: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Username</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Dept</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Block</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d', fontSize: '13px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px', color: '#4361ee', fontWeight: '600', fontSize: '14px' }}>#{user.id}</td>
                      <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{user.username}</td>
                      <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{user.first_name} {user.last_name}</td>
                      <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{user.email}</td>
                      <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{user.department || '-'}</td>
                      <td style={{ padding: '12px', color: '#1a1a2c', fontSize: '14px' }}>{user.block || '-'}</td>
                      <td style={{ padding: '12px' }}>{getRoleBadge(user.role)}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(user.is_active)}</td>
                      <td style={{ padding: '12px' }}>
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleToggle(user.id)}
                            style={{
                              background: user.is_active ? '#ffaa00' : '#10b981',
                              color: user.is_active ? '#000' : '#fff',
                              padding: '6px 16px',
                              border: 'none',
                              borderRadius: '30px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              boxShadow: user.is_active 
                                ? '0 4px 10px rgba(255,170,0,0.2)' 
                                : '0 4px 10px rgba(16,185,129,0.2)',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = user.is_active 
                                ? '0 6px 15px rgba(255,170,0,0.3)' 
                                : '0 6px 15px rgba(16,185,129,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = user.is_active 
                                ? '0 4px 10px rgba(255,170,0,0.2)' 
                                : '0 4px 10px rgba(16,185,129,0.2)';
                            }}
                          >
                            <i className={`bi ${user.is_active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                            {user.is_active ? 'Disable' : 'Enable'}
                          </button>
                        ) : (
                          <span style={{ 
                            color: '#6c757d', 
                            fontSize: '13px', 
                            fontStyle: 'italic',
                            background: '#f8f9fa',
                            padding: '4px 12px',
                            borderRadius: '20px'
                          }}>
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;