import { useState, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  // Sayfa yenilenince localStorage'daki oturumu geri yükle
  const [user, setUser] = useState(() =>
    authService.isAuthenticated() ? authService.getCurrentUser() : null
  );

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}