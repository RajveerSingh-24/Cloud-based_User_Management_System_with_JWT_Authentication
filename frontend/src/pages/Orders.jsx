import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, CheckCircle, Clock, Truck, Package, User, RefreshCw } from 'lucide-react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
    } finally {
      setLoading(false);
    }
  }, []);

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
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle size={13} /> Completed
          </span>
        );
      case 'shipped':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Truck size={13} /> Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Package size={13} /> Cancelled
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
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
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            {isAdmin ? 'All System Orders' : isSeller ? 'Orders for My Products' : 'My Orders'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
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
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No orders found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {isSeller ? 'No customers have purchased your products yet.' : isAdmin ? 'No users have placed orders yet.' : 'Browse the catalog and place your first order!'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Order ID</th>
                {showCustomerCol && (
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Customer</th>
                )}
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Product</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Price</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                {(isSeller || isAdmin) && (
                  <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const product = products[order.product_id] || {};
                const customerName = order.user?.name || order.user?.email || `User #${order.user_id}`;
                const customerEmail = order.user?.email;
                const isUpdating = updatingOrderId === order.id;

                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      #TRX-{order.id}
                    </td>

                    {showCustomerCol && (
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700 }}>
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{customerName}</div>
                            {customerEmail && customerEmail !== customerName && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customerEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {product.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Product</span>}
                      </div>
                      {product.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {product.description.substring(0, 50)}{product.description.length > 50 ? '…' : ''}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                      ₹{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                    </td>

                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {getStatusBadge(order.status)}
                    </td>

                    {(isSeller || isAdmin) && (
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        {order.status === 'pending' ? (
                          <button
                            onClick={() => handleMarkShipped(order.id)}
                            disabled={isUpdating}
                            className="btn btn-primary"
                            style={{
                              padding: '0.4rem 0.9rem',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              opacity: isUpdating ? 0.7 : 1,
                            }}
                          >
                            {isUpdating ? (
                              <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
                            ) : (
                              <><Truck size={13} /> Mark Shipped</>
                            )}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {order.status === 'shipped' ? 'Shipped ✓' : '—'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
