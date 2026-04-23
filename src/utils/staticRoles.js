export const STATIC_ADMIN_ROLES = [
  { id: '1', label: 'Super Admin' },
  { id: '2', label: 'DEO' },
  { id: '3', label: 'Programmer' },
  { id: '4', label: 'HM' },
  { id: '5', label: 'VTP' },
];

export const STATIC_ADMIN_ROLE_IDS = STATIC_ADMIN_ROLES.map((role) => role.id);

export const getStaticRoleLabel = (roleId) => {
  const matchedRole = STATIC_ADMIN_ROLES.find((role) => role.id === String(roleId));
  return matchedRole ? `${matchedRole.id} - ${matchedRole.label}` : String(roleId ?? '');
};
