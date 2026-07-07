import React, { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pgos_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('pgos_token', data.token);
    localStorage.setItem('pgos_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const { data } = await client.post('/auth/register', { username, email, password });
    localStorage.setItem('pgos_token', data.token);
    localStorage.setItem('pgos_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Stateless JWTs aren't tracked server-side, so there's nothing to
  // invalidate on the backend - logging out is purely a client-side action.
  const logout = () => {
    localStorage.removeItem('pgos_token');
    localStorage.removeItem('pgos_user');
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('pgos_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
