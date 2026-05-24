import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, Menu, CheckCircle, ShoppingCart, Trash2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const mockNotifications = [
  { id: 1, text: "Your recent order has been shipped.", time: "1 hour ago", read: false },
  { id: 2, text: "Welcome to NexusCommerce! Complete your profile.", time: "1 day ago", read: false },
  { id: 3, text: "New security update applied.", time: "2 days ago", read: true }
];

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
          <Menu size={24} />
        </button>
        <div className="sm-hide search-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', width: '250px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', display: 'flex' }} 
            className="sm-hide"
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsCartOpen(false); }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%' }}></span>
            )}
          </button>
          
          {isNotifOpen && (
            <div style={{
              position: 'absolute', top: '40px', right: '-80px', width: '300px', 
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(notif => (
                  <div key={notif.id} style={{ 
                    padding: '1rem', borderBottom: '1px solid var(--border-color)', 
                    background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    transition: 'var(--transition-fast)'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '0.3rem' }}>{notif.text}</p>
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
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', display: 'flex' }} 
              onClick={() => { setIsCartOpen(!isCartOpen); setIsNotifOpen(false); }}
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--error-color)', color: 'white', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.35rem', minWidth: '16px', textAlign: 'center' }}>
                  {cartItems.length}
                </span>
              )}
            </button>
            
            {isCartOpen && (
              <div style={{
                position: 'absolute', top: '40px', right: '-40px', width: '320px', 
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100,
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Shopping Cart</h4>
                  <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
                
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {cartItems.length > 0 ? cartItems.map(item => (
                    <div key={item.id} style={{ 
                      padding: '1rem', borderBottom: '1px solid var(--border-color)', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>₹{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.3rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )) : (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ShoppingCart size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem' }}>Your cart is empty.</p>
                    </div>
                  )}
                </div>
                
                {cartItems.length > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700 }}>
                      <span>Total:</span>
                      <span style={{ color: 'var(--accent-primary)' }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }} 
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
            onClick={() => navigate('/settings')}
            title="Go to Settings"
          >
            <div style={{ textAlign: 'right' }} className="sm-hide">
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || user?.email?.split('@')[0] || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="btn" style={{ padding: '0.5rem', marginLeft: '0.5rem' }} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
