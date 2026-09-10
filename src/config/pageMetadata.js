const pageMetadata = [
  { path: '/admin/vocational-training-approval-tracking', title: 'VT Reports Approval Tracking', description: 'View all VTs and month-wise fully approved VT reports.' },
  { path: '/admin/attendance-status', title: 'Attendance Status', description: 'Live current-day status of active vocational teachers.' },
  { path: '/admin/manage-schools', title: 'Manage Schools', description: 'View and manage VT-enabled schools.' },
  { path: '/admin/manage-vtp', title: 'Manage VTP Providers', description: 'Vocational coordinator and provider master list.' },
  { path: '/admin/manage-deo', title: 'Manage DEO', description: 'District education officer master list.' },
  { path: '/admin/manage-users', title: 'Manage Users', description: 'Manage system users and access.' },
  { path: '/admin/trades', title: 'Trades List', description: 'Unique vocational trades and mapped providers.' },
  { path: '/admin/roles', title: 'Role & Permission', description: 'Configure roles and their system permissions.' },
  { path: '/admin/reports', title: 'Reports & Analytics', description: 'Review system reports and performance insights.' },
  { path: '/admin/settings', title: 'Settings', description: 'Manage application preferences and configuration.' },
  { path: '/admin/dashboard', title: 'Admin Dashboard', description: ({ user }) => `Welcome back, ${user?.name || 'Admin'}. Here's what's happening with your system today.` },

  { path: '/vtp/vocational-training-requests', title: 'VT Requests', description: 'Manage and approve On Duty and regularization requests.' },
  { path: '/vtp/attendance-status', title: 'Attendance Status', description: 'Live current-day status of vocational teachers mapped to your VTP.' },
  { path: '/vtp/device-change-requests', title: 'Device Change Requests', description: 'Approve or reject VT mobile device changes.' },
  { path: '/vtp/monthly-reports', title: 'Monthly VT Status Reports', description: 'Final approval of monthly VT reports across your VTP.' },
  { path: '/vtp/leave-management', title: 'VT Leave Management', description: "Review and approve your organization's teacher leave requests." },
  { path: '/vtp/vt-approvals', title: 'Registration Approvals', description: 'Review vocational teacher registration requests.' },
  { path: '/vtp/vt-list', title: "VT's List", description: 'Manage VT staff mapped to your VTP organization.' },
  { path: '/vtp/schools', title: 'Schools List', description: 'Schools mapped to your VTP organization.' },
  { path: '/vtp/trades', title: 'Trades List', description: 'Unique trades mapped to your VTP organization.' },
  { path: '/vtp/dashboard', title: 'VTP Dashboard', description: 'Overview of schools, VT staff and trades mapped to your organization.' },

  { path: '/principal/vocational-training-approval', title: 'VT Status', description: 'Review vocational teacher attendance and approval status.' },
  { path: '/principal/attendance-status', title: 'Attendance Status', description: 'Live current-day status of vocational teachers mapped to your school.' },
  { path: '/principal/vocational-training-requests', title: 'VT Requests', description: 'Manage On Duty and regularization requests.' },
  { path: '/principal/device-change-requests', title: 'Device Change Requests', description: 'Approve or reject VT mobile device changes.' },
  { path: '/principal/teacher-approval', title: 'Registration Approvals', description: 'Review vocational teacher registration requests.' },
  { path: '/principal/school-overview', title: 'School Overview', description: 'View your school and vocational training summary.' },
  { path: '/principal/staff-management', title: 'Staff Management', description: 'Manage vocational staff associated with your school.' },
  { path: '/principal/school-timing', title: 'School Timing', description: 'Configure school opening, closing and grace time.' },
  { path: '/principal/activities', title: 'Activities Management', description: 'Assign and track VT activities.' },
  { path: '/principal/leave-management', title: 'Leave Management', description: 'Review and manage vocational teacher leave requests.' },
  { path: '/principal/holidays', title: 'Holiday Management', description: 'Manage government and school-specific holidays.' },
  { path: '/principal/reports', title: 'Monthly VT Approval Reports', description: 'Review monthly attendance reports for your school.' },
  { path: '/principal/dashboard', title: 'Principal Dashboard', description: 'School-level overview of vocational training operations.' },

  { path: '/deo/vocational-training-approval', title: 'Approval of VT Reports', description: 'Review and approve VT reports across your district.' },
  { path: '/deo/attendance-status', title: 'Attendance Status', description: 'Live current-day status of vocational teachers in your district.' },
  { path: '/deo/monthly-reports', title: 'Monthly VT Approval Reports', description: 'Review monthly vocational teacher reports in your district.' },
  { path: '/deo/vt-schools', title: 'VT Schools', description: 'View vocational training schools in your district.' },
  { path: '/deo/vt-teachers', title: 'VT Teachers', description: 'View vocational teachers in your district.' },
  { path: '/deo/vtps', title: 'VTP List', description: 'View vocational training providers in your district.' },
  { path: '/deo/dashboard', title: 'DEO Dashboard', description: 'District-level overview of vocational training operations.' },
];

export const getPageMetadata = (pathname, user) => {
  const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';
  const match = pageMetadata.find((item) => normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`));
  if (!match) return { title: 'Workspace', description: '' };
  return {
    title: match.title,
    description: typeof match.description === 'function' ? match.description({ user }) : match.description,
  };
};

export default pageMetadata;
