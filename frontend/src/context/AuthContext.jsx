import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          if (decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }
          
          setUser({ id: decoded.sub, role: decoded.role, email: 'Loading...' });
          
          const data = await authService.getCurrentUser();
          setUser(data);
        } catch (error) {
          console.error("Auth init failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.access_token);
    
    const decoded = jwtDecode(data.access_token);
    setUser({ id: decoded.sub, role: decoded.role, email });
    
    const profile = await authService.getCurrentUser();
    setUser(profile);
  };

  const registerUser = async (email, password, role = 'customer', name = '') => {
    await authService.register(email, password, role, name);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
