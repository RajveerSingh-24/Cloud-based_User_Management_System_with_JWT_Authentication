import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Tag, Trash2, Image as ImageIcon, ShoppingCart, Box, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const CATEGORIES = ['Smartphones', 'Laptop', 'Headphone', 'Speaker'];

  const canAddProduct = role === 'admin' || role === 'seller';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data = await productService.getProducts();
      if (role === 'seller') {
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
        image_url: imageUrl,
        category: category || null
      });
      addToast("Product added to catalog successfully!", "success");
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPageTitle = () => {
    if (role === 'customer') return 'Browse Products';
    if (role === 'seller') return 'My Products Catalog';
    return 'Products Catalog Manager';
  };

  const getPageSubtitle = () => {
    if (role === 'customer') return 'Explore and buy the latest premium electronics and catalog arrivals.';
    if (role === 'seller') return 'Manage your store listings, listing prices, and product details.';
    return 'Manage all available products inside the global store catalog.';
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
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>{getPageTitle()}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{getPageSubtitle()}</p>
        </div>
        {canAddProduct && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: '10px' }}>
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Category Tabs Wrapper */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'rgba(21, 16, 42, 0.02)', padding: '0.4rem', borderRadius: '12px', width: 'fit-content' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              background: selectedCategory === cat ? 'var(--brand-primary)' : 'transparent',
              color: selectedCategory === cat ? 'var(--text-light)' : 'var(--text-secondary)',
              boxShadow: selectedCategory === cat ? '0 4px 12px var(--brand-glow)' : 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
            className="category-tab-btn"
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No products found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {products.length === 0 ? (canAddProduct ? 'Get started by adding your first product to the store.' : 'Check back later for new inventory!') : 'No products match the selected category.'}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="product-card top-pick-card hover-translate"
              onClick={() => navigate(`/products/${product.id}`)}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
                height: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', background: 'var(--bg-primary)', borderRadius: '14px', overflow: 'hidden' }}>
                {product.image_url ? (
                  <img src={`http://localhost:8000${product.image_url}`} alt={product.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', transition: 'transform var(--transition-normal)' }} className="product-image" />
                ) : (
                  <Box size={48} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₹{parseFloat(product.price).toFixed(2)}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(role === 'admin' || user?.id === product.owner_id) && (
                      <button 
                        className="btn"
                        style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.1)', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={(e) => handleDeleteProduct(e, product.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
                    >
                      <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && canAddProduct && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsModalOpen(false)}
          style={{
            background: 'rgba(21, 16, 42, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxWidth: '500px', 
              width: '100%',
              background: 'rgba(246, 244, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '28px',
              boxShadow: 'var(--shadow-lg)',
              padding: '2rem'
            }}
          >
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(21, 16, 42, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={22} color="var(--brand-primary)" /> Add New Product
              </h2>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.3rem' }} 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>Product Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Wireless Headphones"
                  style={{ width: '100%', fontSize: '0.9rem', padding: '0.7rem 1rem' }}
                />
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>Description</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '80px', resize: 'vertical', width: '100%', fontSize: '0.9rem', padding: '0.7rem 1rem' }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your product specs and features..."
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    placeholder="0.00"
                    style={{ width: '100%', fontSize: '0.9rem', padding: '0.7rem 1rem' }}
                  />
                </div>

                <div className="input-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>Category</label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ appearance: 'auto', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%', fontSize: '0.9rem', padding: '0.7rem 1rem' }}
                  >
                    <option value="">Optional Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>Product Image</label>
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.2rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: '16px',
                    background: 'rgba(246, 244, 255, 0.55)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    textAlign: 'center',
                    gap: '0.4rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    e.currentTarget.style.background = 'var(--brand-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'rgba(246, 244, 255, 0.55)';
                  }}
                  >
                    <ImageIcon size={20} color="var(--brand-primary)" style={{ opacity: 0.8 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {imageFile ? imageFile.name : 'Upload Product Photo'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      PNG, JPG, JPEG (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => setImageFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center',
                    background: 'var(--brand-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px var(--brand-glow)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Create Listing'}
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
