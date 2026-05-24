/* ============================================
   Admin Authentication Context
   ============================================ */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth, validateCredentials } from '../utils/adminAuth';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored auth on mount
  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUser(storedAuth);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username, password, rememberMe = false) => {
    if (!validateCredentials(username, password)) {
      return { success: false, error: 'Invalid username or password' };
    }

    const authData = setStoredAuth(username, rememberMe);
    setUser(authData);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
