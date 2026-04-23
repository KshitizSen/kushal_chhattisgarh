import { create } from 'zustand';
import { clearAuthSession, readAuthSession, saveAuthSession } from '../utils/authSession';

const loggedOutState = {
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  refreshToken: null,
};

const useAuthStore = create((set) => ({
  initialized: false,
  ...loggedOutState,

  login: (userData, token, refreshToken = null) => {
    saveAuthSession({ token, refreshToken, user: userData });

    set({
      initialized: true,
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      token,
      refreshToken,
    });
  },

  logout: () => {
    clearAuthSession();
    set({
      initialized: true,
      ...loggedOutState,
    });
  },

  initialize: () => {
    const session = readAuthSession();

    if (session) {
      set({
        initialized: true,
        ...session,
      });
      return;
    }

    clearAuthSession();
    set({
      initialized: true,
      ...loggedOutState,
    });
  },
}));

useAuthStore.getState().initialize();

export default useAuthStore;
