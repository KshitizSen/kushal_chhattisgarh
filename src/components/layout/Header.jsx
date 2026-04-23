import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Search, Menu, Moon, Sun, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../common/Badge';

/**
 * Header component with notifications, search, and user menu
 */
const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }

    return document.documentElement.classList.contains('dark');
  });
  const [notifications] = useState([
    { id: 1, title: 'New student enrolled', time: '5 min ago', read: false },
    { id: 2, title: 'Attendance report ready', time: '1 hour ago', read: false },
    { id: 3, title: 'System maintenance', time: '2 hours ago', read: true },
  ]);

  const pageMeta = useMemo(() => {
    const pathname = location.pathname;

    if (pathname.startsWith('/admin/manage-users')) {
      return 'Manage Users';
    }

    if (pathname.startsWith('/admin/manage-schools')) {
      return 'Manage Schools';
    }

    if (pathname.startsWith('/admin/manage-vtp')) {
      return 'Manage VTP';
    }

    if (pathname.startsWith('/admin/reports')) {
      return 'Reports';
    }

    if (pathname.startsWith('/admin/settings')) {
      return 'Settings';
    }

    if (pathname.startsWith('/admin/dashboard')) {
      return 'Dashboard';
    }

    if (pathname.startsWith('/vtp/vt-details')) {
      return 'VT Details';
    }

    if (pathname.startsWith('/vtp/manage-holidays')) {
      return 'Manage Holidays';
    }

    if (pathname.startsWith('/vtp/notifications')) {
      return 'VT Notifications';
    }

    if (pathname.startsWith('/vtp/dashboard')) {
      return 'Dashboard';
    }

    return 'Workspace';
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95 sm:px-4 lg:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
              <button
                onClick={onMenuToggle}
                className="inline-flex rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 lg:hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>

            <div className="min-w-0">
              <h1 className="font-heading text-xl font-semibold text-gray-950 dark:text-white sm:text-2xl">
                {pageMeta}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
              <div className="relative min-w-[200px] flex-1 lg:min-w-[240px] lg:flex-none">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="search"
                  placeholder="Search users, VTs, holidays, notifications..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-900"
                />
              </div>

              <button
                onClick={toggleDarkMode}
                className="inline-flex rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative">
                <button
                  className="relative inline-flex rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="danger"
                      size="sm"
                      className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-900">
                <div className="hidden text-right sm:block">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'User Name'}</p>
                  <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{user?.role || 'Role'}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                  <User className="h-5 w-5" />
                </div>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
