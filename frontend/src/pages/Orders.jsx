import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  RefreshCw, 
  Search, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  
  // Search & Filter State
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('all');

  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const fetchOrdersAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);

      const productMap = {};
      productsData.forEach(p => { productMap[p.id] = p; });

      setProducts(productMap);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      addToast('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchOrdersAndProducts();
  }, [fetchOrdersAndProducts]);

  const handleMarkShipped = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, 'shipped');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      addToast('Order marked as shipped!', 'success');
    } catch (err) {
      console.error('Failed to update order status', err);
      addToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Dynamic Statistics Calculations based on active user role
  const stats = useMemo(() => {
    let totalValue = 0;
    let pendingCount = 0;
    let shippedCount = 0;
    let completedCount = 0;
    let totalCount = 0;

    orders.forEach(order => {
      const product = products[order.product_id] || {};
      const price = parseFloat(product.price || 0);

      // Only count non-cancelled orders for transaction value
      if (order.status?.toLowerCase() !== 'cancelled') {
        totalValue += price;
      }

      if (order.status?.toLowerCase() === 'pending') {
        pendingCount++;
      } else if (order.status?.toLowerCase() === 'shipped') {
        shippedCount++;
      } else if (order.status?.toLowerCase() === 'completed') {
        completedCount++;
      }
      totalCount++;
    });

    return {
      totalValue,
      totalCount,
      pendingCount,
      shippedCount,
      completedCount
    };
  }, [orders, products]);

  // Search and Filter Order Matching
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const product = products[order.product_id] || {};
      const customerName = order.user?.name || order.user?.email || `User #${order.user_id}`;
      const customerEmail = order.user?.email || '';
      
      const matchesSearch = 
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order.id).includes(searchQuery) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `#trx-${order.id}`.includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, products, searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            <CheckCircle size={13} /> Completed
          </span>
        );
      case 'shipped':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            <Truck size={13} /> Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            <Package size={13} /> Cancelled
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            <Clock size={13} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  const showCustomerCol = isSeller || isAdmin;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            {isAdmin ? 'All System Orders' : isSeller ? 'Orders for My Products' : 'My Orders'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isAdmin
              ? 'Monitor and manage every customer transaction.'
              : isSeller
              ? 'View orders placed for your products and update their shipping status.'
              : 'Track the status of your purchased items.'}
          </p>
        </div>
        <button
          className="btn"
          onClick={fetchOrdersAndProducts}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metrics Dashboard Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Metric Card 1: Value Card */}
        <div className="order-stats-card">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 229, 255, 0.1))',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {isCustomer ? <ShoppingBag size={22} /> : <DollarSign size={22} />}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCustomer ? 'Total Spent' : 'Total Revenue'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              ₹{stats.totalValue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Metric Card 2: Count Card */}
        <div className="order-stats-card">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 229, 255, 0.1))',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCustomer ? 'Purchased Items' : 'Total Orders'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {stats.totalCount}
            </div>
          </div>
        </div>

        {/* Metric Card 3: Actionable / Pending Card */}
        <div className="order-stats-card">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 229, 255, 0.1))',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {isCustomer ? <Truck size={22} /> : <Clock size={22} />}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCustomer ? 'Active Shipments' : 'Awaiting Dispatch'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {isCustomer ? (stats.pendingCount + stats.shippedCount) : stats.pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Input Box */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Order ID, product..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setSearchParams({ q: val });
              } else {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('q');
                setSearchParams(newParams);
              }
            }}
            className="search-input-orders"
          />
        </div>

        {/* Status Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '4px',
          maxWidth: '100%'
        }}>
          {['all', 'pending', 'shipped', 'completed', 'cancelled'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--brand-primary), var(--accent-secondary))' : 'rgba(246, 244, 255, 0.6)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--border-color)',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'var(--shadow-sm)'
                }}
                className="filter-pill"
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.2rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>No orders found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {isSeller ? 'No customers have purchased your products yet.' : isAdmin ? 'No users have placed orders yet.' : 'Browse the catalog and place your first order!'}
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
          <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.2rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>No matching orders</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            No orders match the filters or search term "{searchQuery}".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {filteredOrders.map(order => {
            const product = products[order.product_id] || {};
            const customerName = order.user?.name || order.user?.email || `User #${order.user_id}`;
            const customerEmail = order.user?.email;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="order-card-premium"
              >
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.8rem',
                  borderBottom: '1px solid rgba(21, 16, 42, 0.06)',
                  paddingBottom: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '99px',
                      background: 'rgba(124, 58, 237, 0.08)',
                      color: 'var(--brand-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em'
                    }}>
                      #TRX-{order.id}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> Transaction Logged
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Body Content */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}>
                  {/* Left: Product & Customer Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: '1', minWidth: '280px' }}>
                    {/* Thumbnail Box */}
                    <div style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '14px',
                      background: 'rgba(246, 244, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {product.image_url ? (
                        <img
                          src={`http://localhost:8000${product.image_url}`}
                          alt={product.name}
                          style={{
                            maxWidth: '80%',
                            maxHeight: '80%',
                            objectFit: 'contain',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ) : (
                        <Package size={28} color="var(--brand-primary)" style={{ opacity: 0.6 }} />
                      )}
                    </div>

                    {/* Meta Stack */}
                    <div>
                      <h4 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.2rem'
                      }}>
                        {product.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Product</span>}
                      </h4>
                      
                      {/* Customer Info (Sellers/Admins only) */}
                      {showCustomerCol ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-primary))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)'
                          }}>
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {customerName}
                            </span>
                            {customerEmail && customerEmail !== customerName && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                                ({customerEmail})
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4',
                          marginTop: '0.2rem',
                          maxWidth: '400px'
                        }}>
                          {product.description ? (product.description.substring(0, 68) + (product.description.length > 68 ? '…' : '')) : 'Premium purchase item.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Pricing, Status Track & Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '2.5rem',
                    flexWrap: 'wrap',
                    minWidth: '220px'
                  }}>
                    {/* Price stamp */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                        Paid Total
                      </div>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)'
                      }}>
                        ₹{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                      </div>
                    </div>

                    {/* Action controls */}
                    <div>
                      {(isSeller || isAdmin) ? (
                        order.status === 'pending' ? (
                          <button
                            onClick={() => handleMarkShipped(order.id)}
                            disabled={isUpdating}
                            style={{
                              padding: '0.55rem 1.1rem',
                              fontSize: '0.82rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              borderRadius: '12px',
                              background: 'var(--brand-primary)',
                              color: 'white',
                              border: 'none',
                              boxShadow: '0 4px 12px var(--brand-glow)',
                              opacity: isUpdating ? 0.7 : 1,
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            {isUpdating ? (
                              <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
                            ) : (
                              <><Truck size={14} /> Dispatch Order</>
                            )}
                          </button>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#22c55e',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            background: 'rgba(34, 197, 94, 0.08)',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px'
                          }}>
                            ✓ Handed to Carrier
                          </div>
                        )
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="btn"
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.82rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              borderRadius: '12px',
                              fontWeight: 700,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <span>View Details</span>
                            <ArrowRight size={13} />
                          </button>
                          
                          {/* Interactive Customer Logistics Tracking Link */}
                          {order.status?.toLowerCase() === 'shipped' ? (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                addToast('Logistics Update: Order is in transit. Handed over to logistics partner in Mumbai. Estimated delivery: 2 days.', 'info');
                              }}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--brand-primary)',
                                textDecoration: 'none',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <Truck size={12} /> Track Package
                            </a>
                          ) : order.status?.toLowerCase() === 'completed' ? (
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#22c55e',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              <MapPin size={12} /> Delivered
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                              Processing item...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
