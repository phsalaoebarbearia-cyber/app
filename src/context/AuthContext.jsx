import React, { createContext, useState, useContext, useEffect } from 'react';
import { findUserByEmailPassword, createUser, updateUser, loadUsers } from '../services/FirestoreService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ph_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) { localStorage.removeItem('ph_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = await findUserByEmailPassword(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ph_user', JSON.stringify(foundUser));
      return { success: true };
    }
    return { success: false, error: 'Email ou senha incorretos' };
  };

  const register = async (name, email, phone, password) => {
    const users = await loadUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Email já cadastrado' };
    }
    const newUser = {
      id: Date.now().toString(),
      name, email, phone, password,
      role: 'client',
      createdAt: new Date().toISOString(),
    };
    await createUser(newUser);
    setUser(newUser);
    localStorage.setItem('ph_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ph_user');
  };

  const updateProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('ph_user', JSON.stringify(updatedUser));
    if (user.role !== 'admin' && user.id !== 'admin') {
      await updateUser(user.id, updates);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
