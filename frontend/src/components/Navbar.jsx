import React, { useState } from 'react';
import { LogOut, Bell, Search, Menu, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const mockNotifications = [
  { id: 1, text: "Your recent order has been shipped.", time: "1 hour ago", read: false },
  { id: 2, text: "Welcome to NexusCommerce! Complete your profile.", time: "1 day ago", read: false },
  { id: 3, text: "New security update applied.", time: "2 days ago", read: true }
];

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
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
            onClick={() => setIsNotifOpen(!isNotifOpen)}
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ textAlign: 'right' }} className="sm-hide">
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || user?.email?.split('@')[0] || 'User'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
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
