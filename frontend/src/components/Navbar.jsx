import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { LogOut, Bell, Search, Menu, CheckCircle, ShoppingCart, Trash2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const mockNotifications = [
  { id: 1, text: "Your recent order has been shipped.", time: "1 hour ago", read: false },
  { id: 2, text: "Welcome to Tekora! Complete your profile.", time: "1 day ago", read: false },
  { id: 3, text: "New security update applied.", time: "2 days ago", read: true }
];

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';
  const { cartItems, removeFromCart, checkout, isCheckingOut, cartTotal } = useCart();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="navbar-menu-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.45rem',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontStyle: 'normal',
          userSelect: 'none'
        }}>
          TEKORA
        </span>
      </div>

      <div className="sm-hide search-box-container">
        <Search size={16} color="var(--text-secondary)" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            const currentPath = location.pathname;
            const supportsSearch = ['/products', '/orders', '/users'].includes(currentPath);
            if (!supportsSearch && val) {
              navigate(`/products?q=${encodeURIComponent(val)}`);
            } else {
              if (val) {
                setSearchParams({ q: val });
              } else {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('q');
                setSearchParams(newParams);
              }
            }
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            className="sm-hide nav-action-btn"
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsCartOpen(false); }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="badge-dot"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="dropdown-panel" style={{ right: '0px' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(notif => (
                  <div key={notif.id} style={{
                    padding: '1rem', borderBottom: '1px solid var(--border-color)',
                    background: notif.read ? 'transparent' : 'rgba(124, 58, 237, 0.03)',
                    transition: 'var(--transition-fast)'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '0.3rem', fontWeight: notif.read ? 500 : 600 }}>{notif.text}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notif.time}</p>
                  </div>
                )) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CART DROPDOWN (ONLY CUSTOMERS NEED THIS, BUT SAFE FOR ALL) */}
        {user?.role === 'customer' && (
          <div style={{ position: 'relative' }}>
            <button
              className="nav-action-btn"
              onClick={() => { setIsCartOpen(!isCartOpen); setIsNotifOpen(false); }}
              title="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="badge-count">
                  {cartItems.length}
                </span>
              )}
            </button>

            {isCartOpen && (
              <div className="dropdown-panel" style={{ right: '0px', width: '320px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Shopping Cart</h4>
                  <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {cartItems.length > 0 ? cartItems.map(item => (
                    <div key={item.id} style={{
                      padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-color)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 700 }}>₹{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="delete-cart-item-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )) : (
                    <div style={{ padding: '2.5rem 1.2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ShoppingCart size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5, color: 'var(--brand-primary)' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Your cart is empty.</p>
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div style={{ padding: '1.2rem', background: 'rgba(21, 16, 42, 0.02)', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                      <span>Total:</span>
                      <span style={{ color: 'var(--brand-primary)' }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', borderRadius: '10px' }}
                      onClick={() => { checkout(); setIsCartOpen(false); }}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? 'Processing...' : 'Checkout Now'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className="user-profile-pill"
            onClick={() => navigate('/settings')}
            title="Go to Settings"
          >
            <div className="sm-hide user-info">
              <span className="user-name">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <div className="user-avatar">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
