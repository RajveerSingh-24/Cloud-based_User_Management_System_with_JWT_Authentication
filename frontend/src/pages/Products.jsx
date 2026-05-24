import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Tag, Trash2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Products = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddProduct = user?.role === 'admin' || user?.role === 'seller';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data = await productService.getProducts();
      if (user?.role === 'seller') {
        data = data.filter(p => p.owner_id === user.id);
      }
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Front-end Form Validation
    if (!name.trim()) {
      return addToast("Product name cannot be empty.", "error");
    }
    if (parseFloat(price) <= 0 || isNaN(parseFloat(price))) {
      return addToast("Price must be a valid number greater than 0.", "error");
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadResponse = await productService.uploadImage(imageFile);
        imageUrl = uploadResponse.image_url;
      }

      await productService.createProduct({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image_url: imageUrl
      });
      addToast("Product added to catalog successfully!", "success");
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      // Global Axios interceptor automatically creates the error toast!
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyProduct = async (productId) => {
    try {
      await orderService.createOrder(productId);
      addToast("Order placed successfully! Track it in the Orders ledger.", "success");
    } catch (error) {
      // Global Axios interceptor automatically creates the error toast!
    }
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await productService.deleteProduct(productId);
      addToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (error) {
      // handled by interceptor
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Products Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and view all available products in the catalog.</p>
        </div>
        {canAddProduct && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No products found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {canAddProduct ? 'Get started by adding your first product to the store.' : 'Check back later for new inventory!'}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="card product-card" onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
              {(user?.role === 'admin' || user?.id === product.owner_id) && (
                <button 
                  onClick={(e) => handleDeleteProduct(e, product.id)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px', 
                    background: 'rgba(255,255,255,0.8)', border: 'none', 
                    borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', zIndex: 2
                  }}
                  title="Delete Product"
                >
                  <Trash2 size={18} color="var(--error-color)" />
                </button>
              )}
              <div className="product-image-placeholder" style={{ overflow: 'hidden', padding: 0 }}>
                {product.image_url ? (
                  <img src={`http://localhost:8000${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Tag size={40} color="var(--text-muted)" style={{ margin: 'auto' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{product.name}</h3>
                  <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {product.description || 'No description provided.'}
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>View Details</button>
                {user?.role === 'customer' && (
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); handleBuyProduct(product.id); }}>Buy Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && canAddProduct && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2>Add New Product</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct}>
              <div className="input-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Wireless Headphones"
                />
              </div>
              
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                ></textarea>
              </div>
              
              <div className="input-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className="input-field" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                  placeholder="0.00"
                />
              </div>

              <div className="input-group">
                <label>Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={e => setImageFile(e.target.files[0])} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
