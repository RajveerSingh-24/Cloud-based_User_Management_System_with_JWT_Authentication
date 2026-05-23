import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { Activity, Package, ShoppingCart, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex-between" style={{ padding: '1.5rem' }}>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</h3>
    </div>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={24} style={{ color: `rgb(${color})` }} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodData, orderData] = await Promise.all([
          productService.getProducts(),
          orderService.getOrders()
        ]);
        setStats({
          products: prodData.length,
          orders: orderData.length
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Welcome back, <span className="text-gradient">{user?.email?.split('@')[0] || 'User'}</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="grid-cards">
        <StatCard title="Total Revenue" value="$12,426.00" icon={DollarSign} color="99, 102, 241" />
        <StatCard title="Active Products" value={stats.products} icon={Package} color="168, 85, 247" />
        <StatCard title="Recent Orders" value={stats.orders} icon={ShoppingCart} color="14, 165, 233" />
        <StatCard title="Conversion Rate" value="3.2%" icon={Activity} color="34, 197, 94" />
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Revenue Overview</h3>
          <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', gap: '10px', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
              <div key={i} style={{ width: '40px', height: `${h}%`, background: 'var(--accent-primary)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>New order placed</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2 minutes ago</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Product updated</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
