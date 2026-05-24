import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';


const CustomerHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New Products');
  const [heroIndex, setHeroIndex] = useState(0);

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

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(5, products.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  // Determine which products go where based on available data
  // For Hero: choose from the latest 5 products
  const latestProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 5);
  const heroProduct = latestProducts.length > 0 ? latestProducts[heroIndex % latestProducts.length] : null;

  // For Promo Grid: Pick up to 4 different products
  const promoProducts = products.filter(p => p.id !== heroProduct?.id).slice(0, 4);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Hero Section */}
      {heroProduct && (
        <div key={heroProduct.id} className="landing-hero" style={{ animation: 'fadeIn 0.5s ease-out' }}>
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
              <button className="btn btn-primary" onClick={() => navigate(`/products/${heroProduct.id}`)}>Buy Now</button>
              <button className="btn" onClick={() => navigate(`/products/${heroProduct.id}`)}>Learn More</button>
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
                  <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    Buy Now
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
