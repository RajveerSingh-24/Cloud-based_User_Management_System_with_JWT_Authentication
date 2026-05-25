import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, ShieldCheck, Truck, RotateCcw, ShoppingCart, Box } from 'lucide-react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        // Interceptor handles error toast
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleBuyProduct = async () => {
    try {
      await orderService.createOrder(product.id);
      addToast("Order placed successfully! Track it in the Orders ledger.", "success");
    } catch (error) {
      // Handled by interceptor
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button
        className="btn"
        style={{ marginBottom: '2rem', background: 'transparent', padding: '0.5rem 0', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
        onClick={() => navigate('/products')}
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Products
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '12rem', alignItems: 'start' }}>

        {/* Left Column: Image Card */}
        <div
          className="product-card"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            aspectRatio: '1',
            cursor: 'default'
          }}
        >
          {product.image_url ? (
            <img
              src={`http://localhost:8000${product.image_url}`}
              alt={product.name}
              style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transition: 'transform var(--transition-normal)', mixBlendMode: 'multiply' }}
              className="product-image"
            />
          ) : (
            <Box size={96} color="var(--text-muted)" style={{ opacity: 0.3 }} />
          )}
        </div>

        {/* Right Column: Combined Info & Purchase Details */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-hover)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.8rem', textTransform: 'uppercase', background: 'rgba(0, 229, 255, 0.06)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
              <Tag size={12} fill="currentColor" /> {product.category || 'Electronic Gadget'}
            </div>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
              ₹{parseFloat(product.price).toFixed(2)}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>About this item</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.65', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              {product.description || 'No description provided for this next-generation device. Engineered with precision materials to deliver industry-leading efficiency, seamless performance, and future-ready capabilities.'}
            </p>
          </div>

          {/* Features Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex', color: 'var(--brand-primary)', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.08)' }}>
                <Truck size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Free Delivery</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex', color: 'var(--brand-primary)', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.08)' }}>
                <RotateCcw size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>10 Days Return</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex', color: 'var(--brand-primary)', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.08)' }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>1 Year Warranty</span>
            </div>
          </div>

          {/* Inset Purchase Card */}
          <div
            style={{
              background: 'rgba(21, 16, 42, 0.02)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--accent-hover)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent-hover)' }}></div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>In Stock</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sold by Store ID: {product.owner_id}</span>
            </div>

            {user?.role === 'customer' ? (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  className="btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '30px', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', background: 'rgba(124, 58, 237, 0.02)', fontWeight: 700 }}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={16} style={{ marginRight: '0.4rem' }} /> Add to Cart
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '30px', fontWeight: 700 }}
                  onClick={handleBuyProduct}
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, border: '1px dashed var(--border-color)' }}>
                Sign in as a customer to purchase this product.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
