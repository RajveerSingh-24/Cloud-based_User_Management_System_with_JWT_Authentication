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
        <div className="sidebar-logo-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', overflow: 'hidden' }}>
          <img src="/tekora_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.35)' }} alt="Tekora" />
        </div>
        <span className="sidebar-logo-text">Tekora</span>
        <button className="navbar-menu-btn" style={{ marginLeft: 'auto' }} onClick={closeSidebar}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
          <LayoutDashboard size={20} />
          <span className="nav-label">{role === 'customer' ? 'Home' : 'Dashboard'}</span>
          <span className="nav-tooltip">{role === 'customer' ? 'Home' : 'Dashboard'}</span>
        </NavLink>
        
        {/* Admin: Users, Products, Orders */}
        {role === 'admin' && (
          <>
            <NavLink to="/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <Users size={20} />
              <span className="nav-label">Users</span>
              <span className="nav-tooltip">Users</span>
            </NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              <span className="nav-label">All Products</span>
              <span className="nav-tooltip">All Products</span>
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              <span className="nav-label">All Orders</span>
              <span className="nav-tooltip">All Orders</span>
            </NavLink>
          </>
        )}

        {/* Seller: Products, Orders */}
        {role === 'seller' && (
          <>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              <span className="nav-label">My Products</span>
              <span className="nav-tooltip">My Products</span>
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              <span className="nav-label">Store Orders</span>
              <span className="nav-tooltip">Store Orders</span>
            </NavLink>
          </>
        )}

        {/* Customer: Products, My Orders */}
        {role === 'customer' && (
          <>
            <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingBag size={20} />
              <span className="nav-label">Browse Products</span>
              <span className="nav-tooltip">Browse Products</span>
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
              <ShoppingCart size={20} />
              <span className="nav-label">My Orders</span>
              <span className="nav-tooltip">My Orders</span>
            </NavLink>
          </>
        )}
        
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
          <Settings size={20} />
          <span className="nav-label">Settings</span>
          <span className="nav-tooltip">Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
