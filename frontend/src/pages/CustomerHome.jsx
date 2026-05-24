import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { Tag, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';


const CustomerHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New Products');
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const CATEGORIES = ['Smartphones', 'Laptop', 'Headphone', 'Speaker'];
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

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(5, products.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }


  // Determine which products go where based on available data
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // For Hero: choose from the latest 5 products
  const latestProducts = [...filteredProducts].sort((a, b) => b.id - a.id).slice(0, 5);
  const heroProduct = latestProducts.length > 0 ? latestProducts[heroIndex % latestProducts.length] : null;

  // For Promo Grid: Pick up to 4 different products
  // Keep this list static so it doesn't reshuffle every 5 seconds when heroIndex changes
  const stableHeroId = latestProducts.length > 0 ? latestProducts[0].id : null;
  const promoProducts = filteredProducts.filter(p => p.id !== stableHeroId).slice(0, 4);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
              background: selectedCategory === cat ? 'var(--accent-primary)' : 'transparent',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      {heroProduct && (
        <div className="landing-hero" style={{ position: 'relative' }}>
          
          {/* Arrows */}
          <button 
            onClick={(e) => { e.stopPropagation(); setHeroIndex(prev => (prev === 0 ? Math.min(4, products.length - 1) : prev - 1)); }}
            style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setHeroIndex(prev => (prev + 1) % Math.min(5, products.length)); }}
            style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronRight size={24} />
          </button>

          <div className="hero-content">
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: '1.2' }}>
              {heroProduct.name}.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Supercharged for pros.
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
              ₹{parseFloat(heroProduct.price).toFixed(2)}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              From ₹{(parseFloat(heroProduct.price) / 12).toFixed(2)}/mo. per month
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); addToCart(heroProduct); }}>
                <ShoppingCart size={18} style={{ marginRight: '0.4rem' }} /> Add to Cart
              </button>
              <button className="btn" onClick={() => navigate(`/products/${heroProduct.id}`)}>View Details</button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            {heroProduct.image_url ? (
              <img src={`http://localhost:8000${heroProduct.image_url}`} alt={heroProduct.name} className="hero-image" />
            ) : (
              <Tag size={120} color="var(--text-muted)" />
            )}
          </div>
        </div>
      )}

      {/* Promo Grid */}
      {promoProducts.length > 0 && (
        <div className="promo-grid">
          {promoProducts.map((product, idx) => {
            const colors = ['c1', 'c2', 'c3', 'c4'];
            const colorClass = colors[idx % colors.length];
            return (
              <div key={product.id} className={`promo-card ${colorClass}`} onClick={() => navigate(`/products/${product.id}`)}>
                <div className="promo-content">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Top Pick
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    From ₹{parseFloat(product.price).toFixed(2)}
                  </p>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                    <ShoppingCart size={14} style={{ marginRight: '0.3rem' }} /> Add to Cart
                  </button>
                </div>
                <div style={{ paddingLeft: '1rem' }}>
                  {product.image_url ? (
                    <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="promo-image" />
                  ) : (
                    <Tag size={80} color="var(--text-muted)" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
