import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { SEED_USERS, hashPassword } from '../data/seed';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('agan_users');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('agan_users', JSON.stringify(SEED_USERS));
    return SEED_USERS;
  });

  useEffect(() => {
    localStorage.setItem('agan_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const stored = localStorage.getItem('agan_current_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const found = users.find(u => u.id === parsed.id);
      if (found && found.status === 'active') setUser(found);
      else localStorage.removeItem('agan_current_user');
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    const found = users.find(u => u.username === username);
    if (!found) return { success: false, message: 'Username tidak ditemukan' };
    if (found.status !== 'active') return { success: false, message: 'Akun tidak aktif. Hubungi Admin Master Data.' };
    const hashed = hashPassword(password);
    if (found.password_hash !== hashed) return { success: false, message: 'Password salah' };
    const updated = { ...found, last_login: new Date().toISOString() };
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === found.id ? updated : u));
    localStorage.setItem('agan_current_user', JSON.stringify(updated));
    return { success: true, message: 'Login berhasil' };
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('agan_current_user');
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) setUser(updatedUser);
  }, [user]);

  const addUser = useCallback((newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, logout, hasPermission, updateUser, addUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
