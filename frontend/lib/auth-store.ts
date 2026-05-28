"use client";

import { create } from "zustand";
import { api, clearToken, setToken, type User } from "./api";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    try {
      const user = await api.me();
      set({ user, initialized: true });
    } catch {
      clearToken();
      set({ user: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password, full_name) => {
    set({ loading: true });
    try {
      const res = await api.register({ email, password, full_name });
      setToken(res.access_token);
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    clearToken();
    set({ user: null });
  },

  refresh: async () => {
    const user = await api.me();
    set({ user });
  },
}));
