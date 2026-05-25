import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Bell, Lock, Save, Sparkles, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    addToast("Settings saved successfully!", "success");
  };

  // Determine role-based badge class & custom label
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="role-badge role-badge-admin"><Shield size={12} /> System Admin</span>;
      case 'seller':
        return <span className="role-badge role-badge-seller"><Sparkles size={12} /> Verified Seller</span>;
      case 'customer':
      default:
        return <span className="role-badge role-badge-customer"><User size={12} /> Prime Customer</span>;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your profile preferences, notifications, and credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        background: 'rgba(246, 244, 255, 0.45)', 
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.55)', 
        borderRadius: '24px',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Glowing Avatar Sphere */}
          <div 
            className="settings-avatar-glow"
            style={{ 
              width: '84px', 
              height: '84px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-primary))', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '2.2rem', 
              fontWeight: 800,
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>

          {/* Profile metadata block */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {user?.name || 'User Profile'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Mail size={14} color="var(--brand-primary)" /> {user?.email}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                {getRoleBadge(user?.role)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Split Panels */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        marginTop: '0'
      }}>
        
        {/* Preferences Management Card */}
        <div className="card" style={{
          background: 'rgba(246, 244, 255, 0.45)', 
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.55)', 
          borderRadius: '24px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={18} color="var(--brand-primary)" /> Notification Settings
          </h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', flex: 1 }}>
            {/* Toggle 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Push Notifications</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Receive instant alerts for delivery updates.</p>
              </div>
              <label className="switch-container">
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                  className="switch-input"
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Toggle 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Marketing Bulletins</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Receive custom deals and newsletter discounts.</p>
              </div>
              <label className="switch-container">
                <input 
                  type="checkbox" 
                  checked={marketingEnabled} 
                  onChange={(e) => setMarketingEnabled(e.target.checked)} 
                  className="switch-input"
                />
                <span className="switch-slider"></span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn" 
              style={{ 
                marginTop: 'auto', 
                alignSelf: 'flex-start',
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                borderRadius: '12px',
                fontWeight: 700,
                background: 'var(--brand-primary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px var(--brand-glow)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Save size={14} /> <span>Save Preferences</span>
            </button>
          </form>
        </div>

        {/* Security Credentials Card */}
        <div className="card" style={{
          background: 'rgba(246, 244, 255, 0.45)', 
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.55)', 
          borderRadius: '24px',
          padding: '1.75rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={18} color="var(--brand-primary)" /> Credentials & Security
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Setting Box 1 */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Password Security</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem', marginBottom: '0.8rem' }}>Last modified: 30 days ago</p>
              <button 
                className="btn" 
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onClick={() => addToast("Password update is locked in demonstration mode.", "info")}
              >
                Change Password
              </button>
            </div>

            {/* Setting Box 2 */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Two-Factor Verification (2FA)</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem', marginBottom: '0.8rem' }}>Protect your account with an authenticator app.</p>
              <button 
                className="btn" 
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onClick={() => addToast("Multi-Factor authentication is disabled in demonstration mode.", "info")}
              >
                Enable Multi-Factor 2FA
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
