export const permissionGroups = [
  {
    id: 'identity',
    label: 'Identity & Users',
    description: 'User accounts, onboarding, and profile governance.',
    permissions: [
      { value: 'users.view', label: 'View users', description: 'Inspect user profiles and account details.' },
      { value: 'users.create', label: 'Create users', description: 'Add new users and assign default access.' },
      { value: 'users.edit', label: 'Edit users', description: 'Update user information and assignments.' },
      { value: 'users.delete', label: 'Delete users', description: 'Remove or deactivate user accounts.' },
    ],
  },
  {
    id: 'network',
    label: 'School & VTP Network',
    description: 'Institution records, centers, and partner readiness.',
    permissions: [
      { value: 'schools.view', label: 'View schools', description: 'Review registered schools and center information.' },
      { value: 'schools.manage', label: 'Manage schools', description: 'Approve, edit, and maintain school records.' },
      { value: 'vtp.view', label: 'View VTP', description: 'Review vocational training partner details.' },
      { value: 'vtp.manage', label: 'Manage VTP', description: 'Approve, update, and coordinate VTP partners.' },
    ],
  },
  {
    id: 'insights',
    label: 'Reports & Monitoring',
    description: 'Dashboards, reporting, and export access.',
    permissions: [
      { value: 'dashboard.view', label: 'View dashboard', description: 'Access admin overview metrics and live summaries.' },
      { value: 'reports.view', label: 'View reports', description: 'Open operational and performance reports.' },
      { value: 'reports.export', label: 'Export reports', description: 'Download report snapshots and exports.' },
      { value: 'audit.view', label: 'View audit trail', description: 'Review activity history and policy changes.' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance & Security',
    description: 'Role control, settings, and access policy changes.',
    permissions: [
      { value: 'roles.view', label: 'View roles', description: 'Inspect role definitions and permission sets.' },
      { value: 'roles.manage', label: 'Manage roles', description: 'Create, edit, and retire role templates.' },
      { value: 'settings.manage', label: 'Manage settings', description: 'Update platform and security settings.' },
      { value: 'security.manage', label: 'Security controls', description: 'Change access policy and governance rules.' },
    ],
  },
];

export const permissionOptions = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => ({
    ...permission,
    groupId: group.id,
    groupLabel: group.label,
  }))
);

export const permissionLabelMap = permissionOptions.reduce((accumulator, permission) => {
  accumulator[permission.value] = permission.label;
  return accumulator;
}, {});

export const defaultRoles = [
  {
    id: 'role-system-admin',
    name: 'System Admin',
    code: 'system_admin',
    status: 'active',
    memberCount: 4,
    remarks: 'Owns full platform governance, policy enforcement, and emergency access.',
    permissions: permissionOptions.map((permission) => permission.value),
    updatedAt: '2026-04-18',
  },
  {
    id: 'role-operations-manager',
    name: 'Operations Manager',
    code: 'operations_manager',
    status: 'active',
    memberCount: 7,
    remarks: 'Handles schools, partner operations, and day-to-day service coordination.',
    permissions: [
      'users.view',
      'schools.view',
      'schools.manage',
      'vtp.view',
      'vtp.manage',
      'dashboard.view',
      'reports.view',
      'audit.view',
    ],
    updatedAt: '2026-04-16',
  },
  {
    id: 'role-report-analyst',
    name: 'Report Analyst',
    code: 'report_analyst',
    status: 'active',
    memberCount: 3,
    remarks: 'Reviews trends, builds reports, and exports data for leadership reviews.',
    permissions: [
      'dashboard.view',
      'reports.view',
      'reports.export',
      'audit.view',
      'users.view',
      'schools.view',
      'vtp.view',
    ],
    updatedAt: '2026-04-14',
  },
  {
    id: 'role-access-reviewer',
    name: 'Access Reviewer',
    code: 'access_reviewer',
    status: 'inactive',
    memberCount: 2,
    remarks: 'Supports quarterly access reviews and role cleanup with limited admin rights.',
    permissions: ['roles.view', 'audit.view', 'users.view', 'reports.view'],
    updatedAt: '2026-04-09',
  },
];
