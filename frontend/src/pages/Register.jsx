import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, ArrowRight, Eye, EyeOff, User, Store, Shield, ShoppingBag } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      await registerUser(email, password, role, name);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail[0].msg);
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to register. Please try again.');
      }
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
              Create an account to manage your catalogs, orders, and products in one place.
            </h1>
          </div>
        </div>

        {/* Right Side: Register Form Pane */}
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
            <h2>Create an account</h2>
            <p>Sign up in seconds to start building your marketplace workspace.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="auth-input-label">Your full name</label>
              <div className="auth-input-wrapper">
                <User className="input-icon-left" size={18} />
                <input
                  type="text"
                  className="auth-input-field"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="input-group">
              <label className="auth-input-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="4"
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

            <div className="input-group">
              <label className="auth-input-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="auth-input-field"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="4"
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.75rem' }}>
              <label className="auth-input-label">Register As</label>
              <div className="role-select-row">
                <button
                  type="button"
                  className={`role-select-btn ${role === 'customer' ? 'active' : ''}`}
                  onClick={() => setRole('customer')}
                >
                  <User size={20} />
                  <span className="role-btn-title">Customer</span>
                </button>
                <button
                  type="button"
                  className={`role-select-btn ${role === 'seller' ? 'active' : ''}`}
                  onClick={() => setRole('seller')}
                >
                  <Store size={20} />
                  <span className="role-btn-title">Seller</span>
                </button>
                <button
                  type="button"
                  className={`role-select-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <Shield size={20} />
                  <span className="role-btn-title">Admin</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
            <div className="auth-form-footer">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
