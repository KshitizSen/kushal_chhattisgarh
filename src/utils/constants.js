export const ROLES = {
  ADMIN: 'admin',
  VTP: 'vtp',
  PRINCIPAL: 'principal'
};

export const BACKEND_ROLE_MAP = {
  super_admin: ROLES.ADMIN,
  admin: ROLES.ADMIN,
  deo: ROLES.ADMIN,
  vocational_teacher: ROLES.VTP,
  vocational_teacher_provider: ROLES.VTP,
  headmaster: ROLES.PRINCIPAL,
  principal: ROLES.PRINCIPAL,
};

export const ROLE_DASHBOARDS = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.VTP]: '/vtp/dashboard',
  [ROLES.PRINCIPAL]: '/principal/dashboard',
};

export const normalizeRole = (role) => BACKEND_ROLE_MAP[role] || role || null;

export const inferRoleFromPermissions = (permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return null;
  }

  if (
    permissions.includes('roles:view') ||
    permissions.includes('roles:assign') ||
    permissions.includes('users:create') ||
    permissions.includes('users:update') ||
    permissions.includes('users:delete') ||
    permissions.includes('attendance:create_others')
  ) {
    return ROLES.ADMIN;
  }

  if (
    permissions.includes('attendance:view_teachers') ||
    permissions.includes('attendance:view_own') ||
    permissions.includes('leave:request')
  ) {
    return ROLES.VTP;
  }

  if (
    permissions.includes('vt:approve') ||
    permissions.includes('leave:approve')
  ) {
    return ROLES.PRINCIPAL;
  }

  return null;
};

export const getDashboardPath = (role) => ROLE_DASHBOARDS[normalizeRole(role)] || '/login';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const NAV_ITEMS = {
  admin: [
    { path: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: 'manage-users', label: 'Manage Users', icon: 'Users' },
    { path: 'manage-schools', label: 'Manage Schools', icon: 'School' },
    { path: 'manage-vtp', label: 'Manage VTP', icon: 'Briefcase' },
    { path: 'reports', label: 'Reports', icon: 'BarChart' },
    { path: 'settings', label: 'Settings', icon: 'Settings' }
  ],
  vtp: [
    { path: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: 'my-courses', label: 'My Courses', icon: 'BookOpen' }
  ],
  principal: [
    { path: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: 'school-overview', label: 'School Overview', icon: 'School' },
    { path: 'staff-management', label: 'Staff Management', icon: 'Users' }
  ]
};
