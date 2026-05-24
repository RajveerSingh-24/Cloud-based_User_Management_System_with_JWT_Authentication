import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { Link } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card flex-between" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center' }}>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{title}</p>
      <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{value}</h3>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{subtitle}</p>}
    </div>
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '1rem' }}>
      <Icon size={26} style={{ color: `rgb(${color})` }} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
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
      const price = parseFloat(productMap[order.product_id]?.price || 0);
      return acc + price;
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
      const price = parseFloat(productMap[order.product_id]?.price || 0);
      return acc + price;
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

  // --- STATS COMPUTATION FOR CUSTOMER ---
  const customerStats = (() => {
    if (role !== 'customer') return null;
    
    const myOrders = data.orders; // Already filtered by backend for normal customers
    const productMap = {};
    data.products.forEach(p => { productMap[p.id] = p; });

    const totalSpent = myOrders.reduce((acc, order) => {
      const price = parseFloat(productMap[order.product_id]?.price || 0);
      return acc + price;
    }, 0);

    const avgSpent = myOrders.length > 0 ? (totalSpent / myOrders.length) : 0;
    const pendingOrdersCount = myOrders.filter(o => o.status === 'pending').length;

    return {
      myOrdersCount: myOrders.length,
      totalSpent: totalSpent.toFixed(2),
      avgSpent: avgSpent.toFixed(2),
      pendingOrdersCount,
      myOrders
    };
  })();

  // Map products for displaying details in tables
  const productMap = {};
  data.products.forEach(p => { productMap[p.id] = p; });

  if (role === 'customer') {
    return <CustomerHome />;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {role === 'admin' && <ShieldCheck size={28} style={{ color: 'var(--accent-primary)' }} />}
          {role === 'seller' && <TrendingUp size={28} style={{ color: 'var(--accent-primary)' }} />}
          {role === 'customer' && <UserCheck size={28} style={{ color: 'var(--accent-primary)' }} />}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome back, <span className="text-gradient">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {role === 'admin' && 'Enterprise System Administration Control Center. All services are active.'}
          {role === 'seller' && 'Manage your store listings, track incoming customer orders and oversee revenue statistics.'}
          {role === 'customer' && 'Browse the latest products, manage your orders, and checkout seamlessly.'}
        </p>
      </div>

      {/* ADMIN STATS CARDS */}
      {role === 'admin' && adminStats && (
        <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
          <StatCard title="System Revenue" value={`₹${adminStats.totalRevenue}`} icon={DollarSign} color="34, 197, 94" subtitle="Total value of transactions" />
          <StatCard title="Registered Users" value={adminStats.totalUsers} icon={Users} color="99, 102, 241" subtitle="Active client profiles" />
          <StatCard title="Active Listings" value={adminStats.totalProducts} icon={Package} color="168, 85, 247" subtitle="Global catalog entries" />
          <StatCard title="Total Transactions" value={adminStats.totalOrders} icon={ShoppingCart} color="14, 165, 233" subtitle="System order count" />
        </div>
      )}

      {/* SELLER STATS CARDS */}
      {role === 'seller' && sellerStats && (
        <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
          <StatCard title="Store Earnings" value={`₹${sellerStats.totalEarnings}`} icon={DollarSign} color="34, 197, 94" subtitle="Accumulated sales volume" />
          <StatCard title="Incoming Orders" value={sellerStats.myOrdersCount} icon={ShoppingCart} color="14, 165, 233" subtitle="Orders for your products" />
          <StatCard title="My Products" value={sellerStats.myProductsCount} icon={Package} color="168, 85, 247" subtitle="Catalog items listed" />
          <StatCard title="Total Customers" value={sellerStats.uniqueCustomers} icon={Users} color="99, 102, 241" subtitle="Unique customer count" />
        </div>
      )}

      {/* CUSTOMER STATS CARDS */}
      {role === 'customer' && customerStats && (
        <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
          <StatCard title="Total Expenses" value={`₹${customerStats.totalSpent}`} icon={DollarSign} color="34, 197, 94" subtitle="Overall amount spent" />
          <StatCard title="Orders Placed" value={customerStats.myOrdersCount} icon={ShoppingCart} color="14, 165, 233" subtitle="Total successful orders" />
          <StatCard title="Avg. Order Value" value={`₹${customerStats.avgSpent}`} icon={Activity} color="99, 102, 241" subtitle="Average purchase cost" />
          <StatCard title="Pending Checks" value={customerStats.pendingOrdersCount} icon={Clock} color="234, 179, 8" subtitle="Awaiting processing" />
        </div>
      )}

      {/* LOWER PANEL: Dynamic Lists & Data Visualizations */}
      <div className="grid-cards" style={{ gridTemplateColumns: '2fr 1.2fr', alignItems: 'start' }}>
        
        {/* Main List Box */}
        <div className="card" style={{ padding: '1.75rem', minHeight: '380px' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {role === 'admin' && 'Recent Platform Transactions'}
              {role === 'seller' && 'Recent Store Orders'}
              {role === 'customer' && 'Recent Purchases'}
            </h3>
            <Link 
              to="/orders" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--transition-fast)' }}
              className="hover-translate"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Table displaying matching database listings */}
          {data.orders.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={42} style={{ marginBottom: '1rem', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No system activity recorded yet</p>
              {role === 'customer' && (
                <Link to="/products" className="btn" style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  Browse Catalog
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.8rem 0', fontWeight: 600 }}>Order ID</th>
                    <th style={{ padding: '0.8rem 0', fontWeight: 600 }}>Product Name</th>
                    <th style={{ padding: '0.8rem 0', fontWeight: 600 }}>Value</th>
                    <th style={{ padding: '0.8rem 0', fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(role === 'seller' ? sellerStats?.myOrders : data.orders).slice(0, 5).map(order => {
                    const product = productMap[order.product_id] || {};
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 600, color: 'var(--accent-primary)' }}>#TRX-{order.id}</td>
                        <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {product.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Product</span>}
                        </td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>
                          ₹{parseFloat(product.price || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '12px', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: order.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: order.status === 'completed' ? 'rgb(34, 197, 94)' : 'rgb(234, 179, 8)'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Secondary Info Box */}
        <div className="card" style={{ padding: '1.75rem', minHeight: '380px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            {role === 'admin' && 'Enterprise Catalog'}
            {role === 'seller' && 'My Active Listings'}
            {role === 'customer' && 'Catalog Highlights'}
          </h3>

          {data.products.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <Package size={42} style={{ marginBottom: '1rem', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No products available yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(role === 'seller' ? sellerStats?.myProducts : data.products).slice(0, 4).map(product => (
                <div key={product.id} className="flex-between" style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: #{product.id}
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                    ₹{parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
              ))}
              
              <Link to="/products" className="btn text-center" style={{ marginTop: '0.5rem', width: '100%', display: 'block', textDecoration: 'none', boxSizing: 'border-box' }}>
                Browse Full Catalog
              </Link>
            </div>
          )}
        </div>

      </div>
      
    </div>
  );
};

export default Dashboard;
