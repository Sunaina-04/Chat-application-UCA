import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chatspace_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('chatspace_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    // Fetch demo users for the quick switcher
    const fetchDemoUsers = async () => {
      try {
        const res = await api.get('/auth/demo-users');
        if (res.success) {
          setDemoUsers(res.users);
        }
      } catch (err) {
        console.error('Failed to load demo users', err);
      }
    };
    fetchDemoUsers();
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('chatspace_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('chatspace_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Auth verification failed', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', { emailOrUsername, password });
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('chatspace_token', res.token);
      localStorage.setItem('chatspace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const demoLogin = async (targetUserId) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { userId: targetUserId });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('chatspace_token', res.token);
        localStorage.setItem('chatspace_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('chatspace_token', res.token);
      localStorage.setItem('chatspace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('chatspace_token');
      localStorage.removeItem('chatspace_user');
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await api.put('/users/status', { status });
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('chatspace_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        demoUsers,
        login,
        demoLogin,
        register,
        logout,
        updateStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
