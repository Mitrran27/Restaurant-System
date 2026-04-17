import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getStaff: () => api.get('/auth/staff'),
  createStaff: (data) => api.post('/auth/staff', data),
};

// Branches
export const branchAPI = {
  getAll: () => api.get('/branches'),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
};

// Menu
export const menuAPI = {
  getItems: (params) => api.get('/menu', { params }),
  getItem: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories'),
  createCategory: (data) => api.post('/menu/categories', data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data),
};

// Orders
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getMy: () => api.get('/orders/my'),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  cancel: (id, data) => api.patch(`/orders/${id}/cancel`, data),
  getKitchen: (params) => api.get('/orders/kitchen', { params }),
  updatePayment: (id, data) => api.patch(`/orders/${id}/payment`, data),
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  update: (menuItemId, data) => api.put(`/inventory/${menuItemId}`, data),
  toggle: (menuItemId) => api.patch(`/inventory/${menuItemId}/toggle`),
};

// Reviews
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByItem: (menuItemId) => api.get(`/reviews/item/${menuItemId}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.patch('/notifications/read'),
};

// Analytics
export const analyticsAPI = {
  getStats: (params) => api.get('/analytics/stats', { params }),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getBestSellers: (params) => api.get('/analytics/best-sellers', { params }),
  getPeakHours: (params) => api.get('/analytics/peak-hours', { params }),
  getOrderTypes: (params) => api.get('/analytics/order-types', { params }),
};

export default api;
