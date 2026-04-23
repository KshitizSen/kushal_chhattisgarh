import api from './api';
import { inferRoleFromPermissions, normalizeRole } from '../utils/constants';

const mapAuthenticatedUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    backendRole: user.role,
    role: normalizeRole(user.role) || inferRoleFromPermissions(user.permissions),
  };
};

export const login = async ({ phone, email, password }) => {
  const response = await api.post('/auth/login', { phone, email, password });

  return {
    ...response.data,
    data: {
      ...response.data?.data,
      user: mapAuthenticatedUser(response.data?.data?.user),
    },
  };
};

export const register = async (name, email, password, role) => {
  const response = await api.post('/auth/register', { name, email, password, role });
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};
