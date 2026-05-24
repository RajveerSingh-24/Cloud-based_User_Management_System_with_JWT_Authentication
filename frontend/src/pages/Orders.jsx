import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchOrdersAndProducts = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);
      
      const productMap = {};
      productsData.forEach(p => {
        productMap[p.id] = p;
      });
      
      setProducts(productMap);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#22c55e', background: 'rgba(34, 197, 148, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle size={14} /> Completed
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Clock size={14} /> Pending
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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          {user?.role === 'admin' ? 'All System Orders' : 'My Orders'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'admin' 
            ? 'Monitor and manage every single customer transaction in the database.' 
            : 'Track and review the status of your purchased items.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No transactions recorded</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {user?.role === 'admin' ? 'No users have placed orders yet.' : 'Browse the catalog and place your first order!'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Order ID</th>
                {user?.role === 'admin' && <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Customer ID</th>}
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Product Details</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Price</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const product = products[order.product_id] || {};
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} className="table-row-hover">
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>#TRX-{order.id}</td>
                    {user?.role === 'admin' && <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-muted)' }}>User #{order.user_id}</td>}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{product.name || `Product ID: ${order.product_id}`}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{product.description?.substring(0, 50) || 'No details available.'}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      ₹{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {getStatusBadge(order.status)}
                    </td>
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
