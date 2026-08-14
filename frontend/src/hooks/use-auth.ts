'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

export interface RegisterData {
  name: string;
  email: string;	
  password: string;
  confirmPassword?: string;
  document?: string;
  phone?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user } = response.data.data;
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { user } = response.data.data;
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      // Full navigation so the layout guards cannot race back to /auth/login.
      // The state is cleared by the page reload itself.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
      return;
    }
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const response = await api.get('/users/me');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
