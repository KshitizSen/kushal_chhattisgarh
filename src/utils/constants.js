export const ROLES = {
  ADMIN: 'admin',
  VTP: 'vtp',
  PRINCIPAL: 'principal',
  DEO: 'deo'
};

export const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  vtp: '/vtp/vt-approvals',
  principal: '/principal/dashboard',
  deo: '/deo/dashboard',
};

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
    { path: 'vt-approvals', label: 'VT Approvals', icon: 'ShieldCheck' }
  ],
  principal: [
    { path: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: 'school-overview', label: 'School Overview', icon: 'School' },
    { path: 'staff-management', label: 'Staff Management', icon: 'Users' }
  ],
  deo: [
    { path: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: 'district-education-officer', label: 'District Education Officer', icon: 'FileText' }
  ]
};
