import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHome from './CustomerHome';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Clock, 
  Activity,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  CheckCircle,
  Truck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, subtitle, onClick }) => (
  <div 
    className="card" 
    onClick={onClick}
    style={{ 
      padding: '1.5rem', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(246, 244, 255, 0.45)', 
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.55)', 
      borderRadius: '24px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = 'var(--border-color-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.55)';
    }}
  >
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
        {title}
      </p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
        {value}
      </h3>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>{subtitle}</p>}
    </div>
    <div style={{ 
      width: '54px', 
      height: '54px', 
      borderRadius: '16px', 
      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 229, 255, 0.1))', 
      color: 'var(--brand-primary)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginLeft: '1rem',
      flexShrink: 0
    }}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'customer';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    orders: [],
    users: [],
    recentActivity: []
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const promises = [
        productService.getProducts(),
        orderService.getOrders()
      ];

      // Only admins can request the users list
      if (role === 'admin') {
        promises.push(userService.getUsers());
      }

      const results = await Promise.all(promises);
      const productsList = results[0] || [];
      const ordersList = results[1] || [];
      const usersList = role === 'admin' ? results[2] || [] : [];

      setData({
        products: productsList,
        orders: ordersList,
        users: usersList
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  // --- STATS COMPUTATION FOR ADMIN ---
  const adminStats = (() => {
    if (role !== 'admin') return null;
    const totalUsers = data.users.length;
    const totalProducts = data.products.length;
    const totalOrders = data.orders.length;
    
    // Map products for fast price retrieval
    const productMap = {};
    data.products.forEach(p => { productMap[p.id] = p; });

    const totalRevenue = data.orders.reduce((acc, order) => {
      // Exclude cancelled transactions for total sales
      if (order.status?.toLowerCase() !== 'cancelled') {
        const price = parseFloat(productMap[order.product_id]?.price || 0);
        return acc + price;
      }
      return acc;
    }, 0);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2)
    };
  })();

  // --- STATS COMPUTATION FOR SELLER ---
  const sellerStats = (() => {
    if (role !== 'seller') return null;
    
    // Seller's products
    const myProducts = data.products.filter(p => p.owner_id === user?.id);
    const myProductIds = new Set(myProducts.map(p => p.id));
    
    // Orders involving seller's products
    const myOrders = data.orders.filter(o => myProductIds.has(o.product_id));
    
    // Map products for fast price retrieval
    const productMap = {};
    data.products.forEach(p => { productMap[p.id] = p; });

    const totalEarnings = myOrders.reduce((acc, order) => {
      if (order.status?.toLowerCase() !== 'cancelled') {
        const price = parseFloat(productMap[order.product_id]?.price || 0);
        return acc + price;
      }
      return acc;
    }, 0);

    const uniqueCustomers = new Set(myOrders.map(o => o.user_id)).size;

    return {
      myProductsCount: myProducts.length,
      myOrdersCount: myOrders.length,
      totalEarnings: totalEarnings.toFixed(2),
      uniqueCustomers,
      myProducts,
      myOrders
    };
  })();

  // Map products for displaying details in tables
  const productMap = {};
  data.products.forEach(p => { productMap[p.id] = p; });

  if (role === 'customer') {
    return <CustomerHome />;
  }

  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';
  const showCustomerCol = isSeller || isAdmin;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Completed
          </span>
        );
      case 'shipped':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Cancelled
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending
          </span>
        );
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '1.5rem' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {role === 'admin' && <ShieldCheck size={28} style={{ color: 'var(--brand-primary)' }} />}
          {role === 'seller' && <TrendingUp size={28} style={{ color: 'var(--brand-primary)' }} />}
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back, <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text' }}>{user?.name || user?.email?.split('@')[0] || 'Administrator'}</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {role === 'admin' && 'Enterprise System Administration Control Center. All services are fully operational.'}
          {role === 'seller' && 'Manage your store listings, track incoming customer orders and oversee revenue statistics.'}
        </p>
      </div>

      {/* ADMIN STATS CARDS */}
      {role === 'admin' && adminStats && (
        <div className="grid-cards" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="System Revenue" value={`₹${adminStats.totalRevenue}`} icon={DollarSign} subtitle="Overall transaction value" onClick={() => navigate('/orders')} />
          <StatCard title="Registered Users" value={adminStats.totalUsers} icon={Users} subtitle="Active profile logs" onClick={() => navigate('/users')} />
          <StatCard title="Active Listings" value={adminStats.totalProducts} icon={Package} subtitle="Global catalog items" onClick={() => navigate('/products')} />
          <StatCard title="Total Transactions" value={adminStats.totalOrders} icon={ShoppingCart} subtitle="System order count" onClick={() => navigate('/orders')} />
        </div>
      )}

      {/* SELLER STATS CARDS */}
      {role === 'seller' && sellerStats && (
        <div className="grid-cards" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Store Earnings" value={`₹${sellerStats.totalEarnings}`} icon={DollarSign} subtitle="Accumulated sales volume" onClick={() => navigate('/orders')} />
          <StatCard title="Incoming Orders" value={sellerStats.myOrdersCount} icon={ShoppingCart} subtitle="Orders for your products" onClick={() => navigate('/orders')} />
          <StatCard title="My Products" value={sellerStats.myProductsCount} icon={Package} subtitle="Catalog items listed" onClick={() => navigate('/products')} />
          <StatCard title="Total Customers" value={sellerStats.uniqueCustomers} icon={Users} subtitle="Unique customer profiles" onClick={() => navigate('/orders')} />
        </div>
      )}

      {/* LOWER PANEL: Dynamic Lists & Data Ledgers */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Recent Transactions List Panel */}
        <div 
          className="card" 
          style={{ 
            padding: '1.75rem', 
            minHeight: '380px',
            background: 'rgba(246, 244, 255, 0.45)', 
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.55)', 
            borderRadius: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {role === 'admin' && 'Recent Platform Transactions'}
              {role === 'seller' && 'Recent Store Orders'}
            </h3>
            <Link 
              to="/orders" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.3rem', 
                color: 'var(--brand-primary)', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                textDecoration: 'none', 
                transition: 'var(--transition-fast)' 
              }}
              className="hover-translate"
            >
              <span>View All</span> <ArrowRight size={14} />
            </Link>
          </div>

          {/* Table displaying matching database listings */}
          {data.orders.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={42} style={{ marginBottom: '1rem', strokeWidth: 1.5, opacity: 0.6 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No platform transactions logged yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '450px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <th style={{ padding: '0.8rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID</th>
                    {showCustomerCol && <th style={{ padding: '0.8rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</th>}
                    <th style={{ padding: '0.8rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product</th>
                    <th style={{ padding: '0.8rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price</th>
                    <th style={{ padding: '0.8rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(role === 'seller' ? sellerStats?.myOrders : data.orders).slice(0, 5).map(order => {
                    const product = productMap[order.product_id] || {};
                    const customerName = order.user?.name || order.user?.email || `User #${order.user_id}`;
                    
                    return (
                      <tr 
                        key={order.id} 
                        style={{ borderBottom: '1px solid rgba(21, 16, 42, 0.05)', fontSize: '0.88rem' }}
                      >
                        <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                          #TRX-{order.id}
                        </td>
                        
                        {showCustomerCol && (
                          <td style={{ padding: '0.9rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                flexShrink: 0,
                                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)'
                              }}>
                                {customerName.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {customerName}
                              </span>
                            </div>
                          </td>
                        )}

                        <td style={{ padding: '0.9rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {product.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Product</span>}
                        </td>
                        
                        <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                        </td>
                        
                        <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
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
 
        {/* Enterprise Catalog Highlights Preview */}
        <div 
          className="card" 
          style={{ 
            padding: '1.75rem', 
            minHeight: '380px',
            background: 'rgba(246, 244, 255, 0.45)', 
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.55)', 
            borderRadius: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            {role === 'admin' && 'Enterprise Catalog Preview'}
            {role === 'seller' && 'My Active Listings'}
          </h3>
 
          {data.products.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)', flex: 1 }}>
              <Package size={42} style={{ marginBottom: '1rem', strokeWidth: 1.5, opacity: 0.6 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No products available yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {(role === 'seller' ? sellerStats?.myProducts : data.products).slice(0, 4).map(product => (
                <div 
                  key={product.id} 
                  style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem 1.1rem', 
                    borderRadius: '16px', 
                    background: 'rgba(246, 244, 255, 0.65)', 
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.1rem' }}>
                      ID: #{product.id}
                    </p>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    ₹{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                  </p>
                </div>
              ))}
              
              <Link 
                to="/products" 
                className="btn" 
                style={{ 
                  marginTop: 'auto', 
                  width: '100%', 
                  textDecoration: 'none', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>Browse Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
 
      </div>
      
    </div>
  );
};
 
export default Dashboard;
