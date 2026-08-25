import React from 'react';
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
  Home,
  LogOut,
  Shield,
  Building2,
  UserCheck,
  Clock,
  CalendarCheck,
  Briefcase,
  CalendarDays,
  FileText,
  CheckCircle,
  ShieldCheck,
  Route,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const normalizePath = (path) => {
  if (!path || path === '/') {
    return '/';
  }

  return path.replace(/\/+$/, '');
};

const isPathActive = (currentPath, itemPath) => {
  const normalizedCurrentPath = normalizePath(currentPath);
  const normalizedItemPath = normalizePath(itemPath);

  return (
    normalizedCurrentPath === normalizedItemPath ||
    normalizedCurrentPath.startsWith(`${normalizedItemPath}/`)
  );
};

/**
 * Sidebar navigation component with role-based menu items
 */
const Sidebar = ({ collapsed = false, onToggleCollapse, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/';

  // Role-specific navigation items
  const getNavSections = () => {
    const commonItems = [
      {
        title: 'Workspace',
        items: [{ path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> }],
      },
    ];

    const adminItems = [
      {
        title: 'Control Center',
        items: [
          { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          // { path: '/admin/manage-users', label: 'Manage Users', icon: <Users className="h-5 w-5" /> },
          { path: '/admin/manage-schools', label: 'Schools List', icon: <School className="h-5 w-5" /> },
          { path: '/admin/manage-vtp', label: 'Manage VTP', icon: <Building2 className="h-5 w-5" /> },
          { path: '/admin/manage-deo', label: 'Manage DEO', icon: <UserCheck className="h-5 w-5" /> },
          { path: '/admin/vocational-training-approval-tracking', label: 'VTs Approval Tracking', icon: <Route className="h-5 w-5" /> },
          { path: '/admin/trades', label: 'Trades List', icon: <BookOpen className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Governance',
        items: [
          // { path: '/admin/roles', label: 'Role & Permission', icon: <Shield className="h-5 w-5" /> },
          // { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
          { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
        ],
      },
    ];

    const vtpItems = [
      {
        title: 'Overview',
        items: [
          { path: '/vtp/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Approvals',
        items: [
          { path: '/vtp/vt-list', label: "VT's List", icon: <Users className="h-5 w-5" /> },
          { path: '/vtp/vt-approvals', label: 'Register Approvals', icon: <ShieldCheck className="h-5 w-5" /> },
          { path: '/vtp/leave-management', label: 'Leave Management', icon: <CalendarDays className="h-5 w-5" /> },
          { path: '/vtp/vocational-training-requests', label: 'VT Requests', icon: <CheckCircle className="h-5 w-5" /> },
          { path: '/vtp/device-change-requests', label: 'Device Requests', icon: <Shield className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Reports',
        items: [
          { path: '/vtp/monthly-reports', label: 'Monthly Reports', icon: <FileText className="h-5 w-5" /> },
        ],
      },
    ];

    const principalItems = [
      {
        title: 'Overview',
        items: [
          { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { path: '/principal/teacher-approval', label: 'Register Approvals', icon: <UserCheck className="h-5 w-5" /> },
          { path: '/principal/vocational-training-approval', label: 'VT Status', icon: <CalendarCheck className="h-5 w-5" /> },
          { path: '/principal/vocational-training-requests', label: 'VT Requests', icon: <CheckCircle className="h-5 w-5" /> },
          { path: '/principal/device-change-requests', label: 'Device Requests', icon: <Shield className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Staff Management',
        items: [
          { path: '/principal/leave-management', label: 'Leave Management', icon: <CalendarDays className="h-5 w-5" /> },
          { path: '/principal/school-timing', label: 'School Timing', icon: <Clock className="h-5 w-5" /> },
          // { path: '/principal/school-overview', label: 'School Overview', icon: <Home className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Operations',
        items: [
          // { path: '/principal/staff-management', label: 'All Staff', icon: <Users className="h-5 w-5" /> },
          { path: '/principal/activities', label: 'Activities', icon: <Briefcase className="h-5 w-5" /> },
          { path: '/principal/holidays', label: 'Holidays', icon: <School className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Reports',
        items: [
          { path: '/principal/reports', label: 'Monthly Reports', icon: <FileText className="h-5 w-5" /> },
        ],
      },
    ];

    const deoItems = [
      {
        title: 'Overview',
        items: [
          { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { path: '/deo/vocational-training-approval', label: 'Report Approvals', icon: <CalendarCheck className="h-5 w-5" /> },
          { path: '/deo/vtps', label: "VTP's", icon: <Building2 className="h-5 w-5" /> },
          { path: '/deo/vt-schools', label: 'VT School', icon: <School className="h-5 w-5" /> },
          { path: '/deo/vt-teachers', label: 'VT Details', icon: <Users className="h-5 w-5" /> },
        ],
      },
      {
        title: 'Reports',
        items: [
          { path: '/deo/monthly-reports', label: 'Monthly Reports', icon: <FileText className="h-5 w-5" /> },
        ],
      },
    ];

    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'vtp':
        return vtpItems;
      case 'principal':
        return principalItems;
      case 'deo':
        return deoItems;
      default:
        return commonItems;
    }
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <aside
      className="relative flex h-full flex-col rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"
    >
      <div className="border-b border-gray-200 px-2.5 py-2 dark:border-gray-800">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-2 px-2'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <img
              src="/vtp_icon.jpeg"
              alt="Logo"
              className="h-12 w-14 object-contain drop-shadow-sm"
            />
            {!collapsed && (
              <div>
                <h1 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">Kushal Panel</h1>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onToggleCollapse}
        className="absolute -right-4 top-8 z-50 hidden rounded-xl border border-gray-200 bg-white p-1.5 text-gray-500 shadow-md transition hover:bg-gray-50 hover:text-gray-900 lg:inline-flex dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2">
        {getNavSections().map((section) => (
          <div key={section.title}>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = isPathActive(location.pathname, item.path);

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={() =>
                        `group flex items-center rounded-lg px-2.5 py-2 transition-all ${collapsed ? 'justify-center' : 'gap-2'
                        } ${isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                        }`
                      }
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isActive
                          ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-950 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-900 dark:group-hover:text-primary-300'
                          }`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-2.5 dark:border-gray-800">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white ${collapsed ? 'justify-center' : 'gap-3'
            }`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
