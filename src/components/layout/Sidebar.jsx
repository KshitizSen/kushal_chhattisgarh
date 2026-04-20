import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserCog,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

/**
 * Sidebar navigation component with role-based menu items
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/';

  // Role-specific navigation items
  const getNavItems = () => {
    const commonItems = [
      { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ];

    const adminItems = [
      ...commonItems,
      { path: '/admin/manage-users', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
      { path: '/admin/manage-schools', label: 'Manage Schools', icon: <School className="w-5 h-5" /> },
      { path: '/admin/manage-vtp', label: 'Manage VTP', icon: <UserCog className="w-5 h-5" /> },
      { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
      { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    const vtpItems = [
      ...commonItems,
      { path: '/vtp/my-courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    ];

    const principalItems = [
      ...commonItems,
      { path: '/principal/school-overview', label: 'School Overview', icon: <Home className="w-5 h-5" /> },
      { path: '/principal/staff-management', label: 'Staff Management', icon: <Users className="w-5 h-5" /> },
    ];

    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'vtp':
        return vtpItems;
      case 'principal':
        return principalItems;
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kushal</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chhattisgarh</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">K</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* User profile */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Role'}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <span className={`${isActive ? 'text-primary-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <Button
            variant="ghost"
            size="md"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="md"
            className="w-full justify-center"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
