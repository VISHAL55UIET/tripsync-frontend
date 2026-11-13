import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const jwtToken =
      res.token || res.accessToken || res.jwt || (typeof res === 'string' ? res : null);

    if (!jwtToken) {
      throw new Error('JWT token missing in login response');
    }

    const decoded = parseJwt(jwtToken) || {};
    const userObj = {
      id: res.id || res.userId || decoded.userId || decoded.id || null,
      email: res.email || decoded.sub || credentials.email,
      fullName: res.fullName || decoded.fullName || credentials.email.split('@')[0],
      role:
        res.role ||
        decoded.role ||
        decoded.roles?.[0]?.replace('ROLE_', '') ||
        'USER',
    };

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(jwtToken);
    setUser(userObj);
    return userObj;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}