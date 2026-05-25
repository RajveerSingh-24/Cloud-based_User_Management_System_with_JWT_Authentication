import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Trash2, User, Store, Shield, UserX, AlertTriangle, X, Clock, ShoppingBag, Mail, Calendar } from 'lucide-react';
import { userService } from '../services/userService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customer', 'seller', 'admin'
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users registry:", error);
      addToast('Failed to load users registry.', 'error');
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
      console.error("Failed to delete user:", error);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([
        orderService.getOrders().catch(() => []),
        productService.getProducts().catch(() => [])
      ]);
      const uOrders = allOrders.filter(o => o.user_id === user.id);
      setUserOrders(uOrders);
      
      const pMap = {};
      allProducts.forEach(p => pMap[p.id] = p);
      setProductsMap(pMap);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Filter and Search processing
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (user.name || '').toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      `#usr-${user.id}`.includes(query);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="role-badge role-badge-admin"><Shield size={12} /> System Admin</span>;
      case 'seller':
        return <span className="role-badge role-badge-seller"><Store size={12} /> Verified Seller</span>;
      case 'customer':
      default:
        return <span className="role-badge role-badge-customer"><User size={12} /> Prime Customer</span>;
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
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '1.5rem' }}>
      {/* Header section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Registered Users
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          View, search, filter, and moderate all accounts in the ecommerce workspace.
        </p>
      </div>

      {/* Control bar: Search & Filters */}
      <div 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '1.75rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'rgba(246, 244, 255, 0.45)', 
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.55)', 
          borderRadius: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Field */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '450px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="search-input-orders" 
              placeholder="Search by user ID, name, or email..." 
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSearchParams({ q: val });
                } else {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('q');
                  setSearchParams(newParams);
                }
              }}
            />
          </div>

          {/* Filter Segment Pills */}
          <div style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            background: 'rgba(246, 244, 255, 0.6)', 
            padding: '4px', 
            borderRadius: '99px', 
            border: '1px solid var(--border-color)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {['all', 'customer', 'seller', 'admin'].map((role) => {
              const isActive = roleFilter === role;
              const label = role === 'all' ? 'All Accounts' : role === 'customer' ? 'Customers' : role === 'seller' ? 'Sellers' : 'Admins';
              return (
                <button 
                  key={role}
                  className="btn" 
                  onClick={() => setRoleFilter(role)}
                  style={{ 
                    padding: '0.45rem 1.1rem', 
                    fontSize: '0.825rem', 
                    border: 'none',
                    borderRadius: '99px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isActive ? 'linear-gradient(135deg, var(--brand-primary), var(--accent-secondary))' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Users table list */}
      {filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          <UserX size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>No matching users found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Try adjusting your search filters or clear your text query.
          </p>
        </div>
      ) : (
        <div 
          className="card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden', 
            background: 'rgba(246, 244, 255, 0.45)', 
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.55)', 
            borderRadius: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(21, 16, 42, 0.03)' }}>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User ID</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Role</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const initials = (user.name || user.email || 'U').charAt(0).toUpperCase();
                  return (
                    <tr 
                      key={user.id} 
                      onClick={() => handleUserClick(user)} 
                      style={{ borderBottom: '1px solid rgba(21, 16, 42, 0.05)', transition: 'var(--transition-fast)', cursor: 'pointer' }} 
                      className="table-row-hover"
                    >
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '6px', 
                          background: 'rgba(124, 58, 237, 0.08)', 
                          color: 'var(--brand-primary)', 
                          fontSize: '0.78rem', 
                          fontWeight: 700 
                        }}>
                          #USR-{user.id}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-primary))', 
                            color: 'white',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.75rem', 
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)'
                          }}>
                            {initials}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                            {user.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>No name set</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        {getRoleBadge(user.role)}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.35rem', 
                          color: user.is_active ? '#22c55e' : '#ef4444', 
                          background: user.is_active ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.is_active ? '#22c55e' : '#ef4444' }}></span>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                        {user.id === currentUser.id ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>Current Account</span>
                        ) : (
                          <button 
                            className="btn" 
                            style={{ 
                              margin: '0 auto',
                              padding: '0.55rem',
                              background: 'rgba(239, 68, 68, 0.05)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.1)',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            onClick={(e) => { e.stopPropagation(); setDeletingUserId(user.id); }}
                            title="Delete User Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Inset Alert Modal */}
      {deletingUserId && (
        (() => {
          const userToDelete = users.find(u => u.id === deletingUserId) || {};
          return (
            <div 
              className="modal-overlay" 
              onClick={() => setDeletingUserId(null)}
              style={{
                background: 'rgba(21, 16, 42, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()} 
                style={{ 
                  maxWidth: '440px',
                  background: 'rgba(246, 244, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '28px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '2.2rem'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                    <AlertTriangle size={26} color="#ef4444" />
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Confirm User Deletion</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    Are you sure you want to permanently delete user <strong style={{ color: 'var(--text-primary)' }}>{userToDelete.email}</strong>? This action is irreversible.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }} 
                    onClick={() => setDeletingUserId(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      background: '#ef4444', 
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }} 
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

      {/* User Details Audit Modal */}
      {selectedUser && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedUser(null)}
          style={{
            background: 'rgba(21, 16, 42, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '620px', 
              width: '100%',
              background: 'rgba(246, 244, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '28px',
              boxShadow: 'var(--shadow-lg)',
              padding: '2rem'
            }}
          >
            {/* Modal Header */}
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(21, 16, 42, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-primary))', 
                  color: 'white',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: '1.3rem',
                  boxShadow: '0 4px 12px var(--brand-glow)'
                }}>
                  {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {selectedUser.name || <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-muted)' }}>No name set</span>}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Mail size={12} color="var(--brand-primary)" /> {selectedUser.email}
                  </p>
                </div>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.3rem' }} 
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.75rem' }}>
              <div className="card" style={{ padding: '1.1rem', background: 'rgba(246, 244, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Account Role</p>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div className="card" style={{ padding: '1.1rem', background: 'rgba(246, 244, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>System Status</p>
                <div style={{ marginTop: '0.2rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: selectedUser.is_active ? '#22c55e' : '#ef4444', background: selectedUser.is_active ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedUser.is_active ? '#22c55e' : '#ef4444' }}></span>
                    {selectedUser.is_active ? 'Active Status' : 'Suspended Account'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal audit transactions */}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={16} color="var(--brand-primary)" /> Customer Transaction Log
            </h3>
            
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto', borderWidth: '2.5px' }}></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>Decrypting logs...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(246, 244, 255, 0.35)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                <Clock size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>No transaction history found for this profile.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '0.4rem' }} className="custom-scrollbar">
                {userOrders.map(order => {
                  const product = productsMap[order.product_id] || { name: 'Unknown Product', price: 0 };
                  const isCompleted = order.status?.toLowerCase() === 'completed';
                  const statusLabel = order.status?.charAt(0).toUpperCase() + order.status?.slice(1);
                  return (
                    <div 
                      key={order.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.9rem 1.1rem', 
                        border: '1px solid rgba(255, 255, 255, 0.45)', 
                        background: 'rgba(246, 244, 255, 0.55)', 
                        borderRadius: '16px', 
                        marginBottom: '0.6rem' 
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ color: 'var(--brand-primary)' }}>#TRX-{order.id}</span>
                          <span>•</span>
                          <span style={{ color: isCompleted ? '#22c55e' : '#eab308' }}>{statusLabel}</span>
                        </p>
                      </div>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.02rem' }}>
                        ₹{parseFloat(product.price || 0).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
