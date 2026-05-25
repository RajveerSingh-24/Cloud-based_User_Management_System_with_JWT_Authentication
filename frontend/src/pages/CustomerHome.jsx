import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import {
  Zap,
  ArrowRight,
  Box,
  ShieldCheck,
  Cpu,
  Wifi,
  Package,
  Users,
  Star,
  HeadphonesIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  // Pick some top products
  const topPicks = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '2rem' }}>

      {/* HERO SECTION */}
      <div className="landing-hero">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-hover)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            <Zap size={16} fill="currentColor" /> NEXT-GEN GADGETS
          </div>
          <h1 style={{ fontSize: '5.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            TECH THAT <br />
            <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-primary))', WebkitBackgroundClip: 'text' }}>EMPOWERS</span> <br />
            EVERY DAY
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '400px' }}>
            Smart. Sleek. Seamless. <br />
            Explore technology designed to elevate the way you live.
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: '0.9rem 1.8rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', gap: '0.8rem' }}
            onClick={() => navigate('/products')}
          >
            EXPLORE DEVICES
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '50%', padding: '0.3rem', display: 'flex', color: 'var(--accent-primary)' }}>
              <ArrowRight size={14} strokeWidth={3} />
            </div>
          </button>
        </div>

        {/* Standalone Hero Imagery */}
        <div className="sm-hide hero-image-wrapper">
          <img
            src="/hero_image.jpg"
            alt="Premium Tech Devices"
            className="hero-image"
          />
        </div>
      </div>

      {/* BUILT FOR THE FUTURE (Dark Banner) */}
      <div className="dark-card" style={{
        padding: '3.5rem',
        borderRadius: '24px',
        marginBottom: '3rem',
        marginTop: '-6.5rem',
        position: 'relative',
        zIndex: 5,
        boxShadow: '0 20px 45px rgba(21, 16, 42, 0.3)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>BUILT FOR THE FUTURE</h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem'
        }}>
          <div>
            <div className="feature-icon-wrapper"><Box size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', color: 'white' }}>INNOVATIVE DESIGN</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'justify' }}>Crafted with precision and a focus on the future.</p>
          </div>
          <div>
            <div className="feature-icon-wrapper"><Zap size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', color: 'white' }}>POWERFUL PERFORMANCE</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'justify' }}>High-speed, high-efficiency technology you can trust.</p>
          </div>
          <div>
            <div className="feature-icon-wrapper"><Wifi size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', color: 'white' }}>SEAMLESS CONNECTIVITY</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'justify' }}>Stay connected anywhere, anytime with ease.</p>
          </div>
          <div>
            <div className="feature-icon-wrapper"><ShieldCheck size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', color: 'white' }}>SECURE BY DEFAULT</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'justify' }}>Advanced protection for your data and devices.</p>
          </div>
        </div>
      </div>

      {/* EXPLORE OUR TOP PICKS */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>EXPLORE OUR <br /> TOP PICKS</h2>
          <div style={{ width: '40px', height: '4px', background: 'var(--accent-hover)', borderRadius: '2px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {topPicks.map(product => (
            <div
              key={product.id}
              style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
              onClick={() => navigate(`/products/${product.id}`)}
              className="top-pick-card hover-translate"
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', background: 'var(--bg-primary)', borderRadius: '14px' }}>
                {product.image_url ? (
                  <img src={`http://localhost:8000${product.image_url}`} alt={product.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', transition: 'transform var(--transition-normal)' }} className="product-image" />
                ) : (
                  <Box size={64} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{product.name}</h3>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₹{parseFloat(product.price).toFixed(2)}</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                >
                  <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS FOOTER (Dark Purple) */}
      <div className="dark-card" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Package size={28} className="neon-text" />
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>120+</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Premium Products</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={28} className="neon-text" />
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>2.5M+</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Happy Customers</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Star size={28} className="neon-text" />
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>98%</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Satisfaction Rate</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <HeadphonesIcon size={28} className="neon-text" />
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>24/7</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Expert Support</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerHome;
