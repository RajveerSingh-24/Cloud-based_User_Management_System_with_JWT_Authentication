import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShoppingBag } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        {/* Left Side: Visual Mesh Gradient Pane */}
        <div className="auth-visual-pane">
          <div className="visual-logo-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
              padding: '4px',
              overflow: 'hidden'
            }}>
              <img src="/tekora_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.35)' }} alt="Tekora" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>
              Tekora
            </span>
          </div>
          
          <div className="visual-content">
            <p className="visual-overtitle">eCommerce Hub</p>
            <h1 className="visual-title">
              Get access to your personal ecommerce workspace for total clarity and control.
            </h1>
          </div>
        </div>

        {/* Right Side: Sign In Form Pane */}
        <div className="auth-form-pane">
          <div className="auth-form-header">
            <div className="form-logo-mark" style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px var(--brand-glow)',
              padding: '4px',
              overflow: 'hidden'
            }}>
              <img src="/tekora_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.35)' }} alt="Tekora" />
            </div>
            <h2>Sign in to account</h2>
            <p>Access your orders, workspace, and personal catalog in one place.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="auth-input-label">Your email</label>
              <div className="auth-input-wrapper">
                <Mail className="input-icon-left" size={18} />
                <input 
                  type="email" 
                  className="auth-input-field" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label className="auth-input-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input-field" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', borderRadius: '10px' }} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
            <div className="auth-form-footer">
              Don't have an account? <Link to="/register">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
