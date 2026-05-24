import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
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
        style={{ marginBottom: '2rem', background: 'transparent', padding: '0.5rem 0' }}
        onClick={() => navigate('/products')}
      >
        <ArrowLeft size={18} /> Back to Products
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Image Gallery */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {product.image_url ? (
            <img 
              src={`http://localhost:8000${product.image_url}`} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <Tag size={64} color="var(--text-muted)" />
            </div>
          )}
        </div>

        {/* Middle Column: Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.2' }}>{product.name}</h1>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>About this item</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {product.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '50%' }}>
                <Truck size={24} color="var(--text-secondary)" />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Free Delivery</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '50%' }}>
                <RotateCcw size={24} color="var(--text-secondary)" />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>10 Days Replacement</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '50%' }}>
                <ShieldCheck size={24} color="var(--text-secondary)" />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>1 Year Warranty</span>
            </div>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            ₹{parseFloat(product.price).toFixed(2)}
          </span>
          <span style={{ color: 'var(--success-color)', fontWeight: 600, fontSize: '1.1rem' }}>
            In Stock
          </span>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sold by Store ID: {product.owner_id}
          </p>
          
          {user?.role === 'customer' ? (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}
              onClick={handleBuyProduct}
            >
              Buy Now
            </button>
          ) : (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Sign in as a customer to purchase this product.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
