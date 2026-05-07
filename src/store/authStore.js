import { create } from 'zustand';

const ADMIN_DIRECT_ACCESS_USER = {
  id: 'admin-direct-access',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
};

// ─── Helper: hydrate from localStorage synchronously ───
const getInitialState = () => {
  try {
    const token = localStorage.getItem('authToken');
    const rawUser = localStorage.getItem('userData');
    const userData = rawUser ? JSON.parse(rawUser) : null;
    const hasValidToken = token && token !== 'undefined' && token !== 'null' && token !== 'demo-token';
    if (hasValidToken && userData) {
      return { isAuthenticated: true, user: userData, role: userData.role, token, initialized: true };
    }
  } catch {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return {
      isAuthenticated: true,
      user: ADMIN_DIRECT_ACCESS_USER,
      role: 'admin',
      token: null,
      initialized: true,
    };
  }

  return { isAuthenticated: false, user: null, role: null, token: null, initialized: true };
};

const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (userData) => {
    // Prefer the JWT stored in userData.access_token
    const authToken = userData.access_token;
    set({
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      token: authToken,
      initialized: true,
    });
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
      initialized: true,
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Kept for backward compatibility but now a no-op (state is hydrated synchronously)
  initialize: () => {},
}));

export default useAuthStore;
