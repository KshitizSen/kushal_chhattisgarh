import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  
  login: (userData, token = 'demo-token') => {
    const authToken = token || 'demo-token';
    set({
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      token: authToken
    });
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      role: null,
      token: null
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
  
  initialize: () => {
    const token = localStorage.getItem('authToken');
    const rawUserData = localStorage.getItem('userData');

    try {
      const userData = rawUserData ? JSON.parse(rawUserData) : null;
      const hasValidToken = token && token !== 'undefined' && token !== 'null';

      if (hasValidToken && userData) {
        set({
          isAuthenticated: true,
          user: userData,
          role: userData.role,
          token,
        });
      }
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }
}));

export default useAuthStore;
