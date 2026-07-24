'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock/data';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (username: string, password: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>(
    'pm-workbench-auth',
    null
  );
  const [users, setUsers] = useLocalStorage<User[]>('pm-workbench-users', MOCK_USERS);

  const currentUser = currentUserId
    ? users.find((u) => u.id === currentUserId) || null
    : null;

  const login = useCallback(
    (username: string, password: string): { success: boolean; error?: string } => {
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) {
        return { success: false, error: '用户名或密码错误' };
      }
      setCurrentUserId(user.id);
      return { success: true };
    },
    [users, setCurrentUserId]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, [setCurrentUserId]);

  const register = useCallback(
    (username: string, password: string): { success: boolean; error?: string } => {
      if (users.find((u) => u.username === username)) {
        return { success: false, error: '用户名已存在' };
      }
      const newUser: User = {
        id: `u-${Date.now()}`,
        username,
        password,
      };
      setUsers([...users, newUser]);
      setCurrentUserId(newUser.id);
      return { success: true };
    },
    [users, setUsers, setCurrentUserId]
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: !!currentUser, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
