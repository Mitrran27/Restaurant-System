import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register(data);
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token && !!get().user,
  isAdmin: () => get().user?.role === 'ADMIN',
  isCashier: () => get().user?.role === 'CASHIER',
  isKitchen: () => get().user?.role === 'KITCHEN',
  isCustomer: () => get().user?.role === 'CUSTOMER',
  isStaff: () => ['ADMIN', 'CASHIER', 'KITCHEN'].includes(get().user?.role),
}));

export default useAuthStore;
