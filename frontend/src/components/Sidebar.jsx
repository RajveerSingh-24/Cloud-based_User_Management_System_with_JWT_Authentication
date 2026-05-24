import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={18} color="white" />
        </div>
        <span>Nexus<span className="text-gradient">Commerce</span></span>
        <button className="navbar-menu-btn" style={{ marginLeft: 'auto' }} onClick={closeSidebar}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        {/* Admin: Users, Products, Orders */}
        {role === 'admin' && (
          <>
            <NavLink to="/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <Users size={20} />
              Users
            </NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              All Products
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              All Orders
            </NavLink>
          </>
        )}

        {/* Seller: Products, Orders */}
        {role === 'seller' && (
          <>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              My Products
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              Store Orders
            </NavLink>
          </>
        )}

        {/* Customer: Products, My Orders */}
        {role === 'customer' && (
          <>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              Browse Products
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              My Orders
            </NavLink>
          </>
        )}
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <NavLink to="/settings" className="nav-item" onClick={closeSidebar}>
            <Settings size={20} />
            Settings
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
