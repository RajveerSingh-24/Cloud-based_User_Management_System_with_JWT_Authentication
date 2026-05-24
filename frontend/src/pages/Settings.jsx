import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Bell, Lock, Save } from 'lucide-react';
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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your profile preferences and security settings.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--accent-primary)" /> Profile Information
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name || 'User'}</p>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                <Mail size={14} /> {user?.email}
              </p>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>
                <Shield size={14} /> Role: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '0' }}>
        
        {/* Preferences */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--accent-primary)" /> Preferences
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Push Notifications</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts for order updates.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationsEnabled ? 'var(--accent-primary)' : 'var(--bg-primary)', transition: '.4s', borderRadius: '34px', border: '1px solid var(--border-color)' }}>
                  <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: notificationsEnabled ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Marketing Emails</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive promotional offers.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={marketingEnabled} onChange={(e) => setMarketingEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: marketingEnabled ? 'var(--accent-primary)' : 'var(--bg-primary)', transition: '.4s', borderRadius: '34px', border: '1px solid var(--border-color)' }}>
                  <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: marketingEnabled ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
              <Save size={16} /> Save Preferences
            </button>
          </form>
        </div>

        {/* Security (Read Only / Placeholder) */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--accent-primary)" /> Security
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Password</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Last changed: 30 days ago</p>
              <button className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => addToast("Password change is disabled in demo mode", "info")}>
                Update Password
              </button>
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Two-Factor Authentication</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Add an extra layer of security.</p>
              <button className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => addToast("2FA setup is disabled in demo mode", "info")}>
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
