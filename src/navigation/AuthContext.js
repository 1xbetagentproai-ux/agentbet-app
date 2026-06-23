// src/navigation/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from '../config/backendReal';
import { LoadingScreen } from '../components/UI';

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await Auth.getCurrentUser();
      if (u) { setUser(u); setRole(u.role); }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier, password) => {
    const r = await Auth.login(identifier, password);
    if (r.success) { setUser(r.user); setRole(r.user.role); }
    return r;
  };

  const loginAfterRegister = async (phone) => {
    const r = await Auth.finalizeRegisterLogin(phone);
    if (r.success) { setUser(r.user); setRole(r.role); }
    return r;
  };

  const logout = async () => { await Auth.logout(); setUser(null); setRole(null); };

  const refreshUser = async () => {
    const u = await Auth.getCurrentUser();
    if (u) setUser(u);
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, role, login, loginAfterRegister, logout, refreshUser, isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
