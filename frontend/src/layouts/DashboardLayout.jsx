import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ShoppingBag } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Standalone Logo at the absolute top-left corner */}
      <div className="standalone-logo">
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px var(--accent-glow)', padding: '4px', overflow: 'hidden' }}>
          <img src="/tekora_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.35)' }} alt="Tekora" />
        </div>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
