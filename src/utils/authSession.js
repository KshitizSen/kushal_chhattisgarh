const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

const isBrowser = typeof window !== 'undefined';

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string' || !isBrowser) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  if (!token || token === 'undefined' || token === 'null') {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 > Date.now();
};

export const clearAuthSession = () => {
  if (!isBrowser) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_DATA_KEY);
};

export const saveAuthSession = ({ token, refreshToken = null, user }) => {
  if (!isBrowser) {
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  if (refreshToken) {
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  window.sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const readAuthSession = () => {
  if (!isBrowser) {
    return null;
  }

  const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  const rawUser = window.sessionStorage.getItem(USER_DATA_KEY);

  if (!isTokenValid(token) || !rawUser) {
    clearAuthSession();
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    if (!user?.role) {
      clearAuthSession();
      return null;
    }

    return {
      isAuthenticated: true,
      user,
      role: user.role,
      token,
      refreshToken:
        refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null'
          ? refreshToken
          : null,
    };
  } catch {
    clearAuthSession();
    return null;
  }
};
