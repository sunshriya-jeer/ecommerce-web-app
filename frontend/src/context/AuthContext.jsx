import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore Supabase signout error if offline/invalid session
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  // Initialize and check current user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.response?.data?.message || err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (full_name, email, password, confirmPassword) => {
    const res = await authService.register({
      full_name,
      email,
      password,
      confirmPassword,
    });
    return res;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
