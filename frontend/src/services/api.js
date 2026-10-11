import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if access token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const productService = {
  getAll: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },
  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const orderService = {
  create: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },
};

export const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
};

export default api;
