import React, { useState, useEffect } from 'react';
import { Search, Trash2, User, Store, Shield, UserX, AlertTriangle } from 'lucide-react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customer', 'seller', 'admin'
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users registry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, userEmail) => {
    if (userId === currentUser.id) {
      addToast("Failed action: You cannot delete your own admin account.", "error");
      setDeletingUserId(null);
      return;
    }
    
    try {
      await userService.deleteUser(userId);
      addToast(`User ${userEmail} has been deleted successfully.`, "success");
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      // Global interceptor handles general toast error, but close the modal
    } finally {
      setDeletingUserId(null);
    }
  };

  // Filter and Search processing
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (user.name || '').toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Shield size={12} /> Admin
          </span>
        );
      case 'seller':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Store size={12} /> Seller
          </span>
        );
      case 'customer':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <User size={12} /> Customer
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Registered Users</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View, search, filter, and moderate all accounts in the ecommerce workspace.</p>
      </div>

      {/* Control bar: Search & Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Field */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '450px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name or email..." 
              style={{ width: '100%', paddingLeft: '2.75rem', fontSize: '0.9rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Segment Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-primary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button 
              className="btn" 
              style={{ 
                padding: '0.45rem 1rem', 
                fontSize: '0.825rem', 
                border: 'none',
                background: roleFilter === 'all' ? 'var(--bg-elevated)' : 'transparent',
                color: roleFilter === 'all' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => setRoleFilter('all')}
            >
              All
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '0.45rem 1rem', 
                fontSize: '0.825rem', 
                border: 'none',
                background: roleFilter === 'customer' ? 'var(--bg-elevated)' : 'transparent',
                color: roleFilter === 'customer' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => setRoleFilter('customer')}
            >
              Customers
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '0.45rem 1rem', 
                fontSize: '0.825rem', 
                border: 'none',
                background: roleFilter === 'seller' ? 'var(--bg-elevated)' : 'transparent',
                color: roleFilter === 'seller' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => setRoleFilter('seller')}
            >
              Sellers
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '0.45rem 1rem', 
                fontSize: '0.825rem', 
                border: 'none',
                background: roleFilter === 'admin' ? 'var(--bg-elevated)' : 'transparent',
                color: roleFilter === 'admin' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => setRoleFilter('admin')}
            >
              Admins
            </button>
          </div>

        </div>
      </div>

      {/* Users table list */}
      {filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <UserX size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h3>No matching users found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Try adjusting your search filters or clear your text query.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>User ID</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Account Role</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} className="table-row-hover">
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>#USR-{user.id}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>No name set</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: user.is_active ? '#22c55e' : '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.is_active ? '#22c55e' : '#ef4444' }}></span>
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    {user.id === currentUser.id ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Current Account</span>
                    ) : (
                      <button 
                        className="btn" 
                        style={{ 
                          margin: '0 auto',
                          padding: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.05)',
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.1)'
                        }}
                        onClick={() => setDeletingUserId(user.id)}
                        title="Delete User Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Inset Alert Modal */}
      {deletingUserId && (
        (() => {
          const userToDelete = users.find(u => u.id === deletingUserId) || {};
          return (
            <div className="modal-overlay" onClick={() => setDeletingUserId(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <AlertTriangle size={28} color="#ef4444" />
                  </div>
                  <h2>Confirm User Deletion</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Are you sure you want to permanently delete user <strong style={{ color: 'white' }}>{userToDelete.email}</strong>? This action is irreversible.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDeletingUserId(null)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ flex: 1, justifyContent: 'center', background: '#ef4444', boxShadow: 'none' }} 
                    onClick={() => handleDeleteUser(userToDelete.id, userToDelete.email)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default Users;
