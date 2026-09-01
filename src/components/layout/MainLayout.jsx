import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

/**
 * Main layout wrapper for authenticated pages
 */
const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar - desktop */}
        <div
          className={`hidden flex-shrink-0 transition-all duration-300 lg:block ${
            sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          }`}
        >
          <div
            className={`fixed inset-y-0 left-0 z-20 hidden p-2 lg:block ${
              sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
            />
          </div>
        </div>

        {/* Sidebar - mobile */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(17rem,85vw)] p-2">
              <Sidebar
                collapsed={false}
                onClose={() => setMobileSidebarOpen(false)}
                onToggleCollapse={() => {}}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
          <main className="app-density flex-1 px-3 pb-5 pt-3 sm:px-5 lg:px-6">
            <div className="page-route-content mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
