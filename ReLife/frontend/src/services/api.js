import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('relife_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('relife_token');
      localStorage.removeItem('relife_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const googleAuth = (credential, selectedRole) => api.post('/api/auth/google', { credential, selectedRole });
export const getMe = () => api.get('/api/auth/me');

/** Redirect path after login based on role */
export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'ngo':
      return '/ngo/dashboard';
    case 'service_provider':
      return '/service-provider/dashboard';
    case 'delivery_partner':
      return '/delivery/dashboard';
    default:
      return '/user/dashboard';
  }
};

export const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'ngo', label: 'NGO' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'delivery_partner', label: 'Delivery Partner' },
];
export const forgotPassword = (email) => api.post('/api/auth/forgotpassword', { email });
export const resetPassword = (token, password) =>
  api.put(`/api/auth/resetpassword/${token}`, { password });
export const updateDetails = (data) => api.put('/api/auth/updatedetails', data);
export const updatePassword = (data) => api.put('/api/auth/updatepassword', data);

// Products
export const getProducts = (params) => api.get('/api/products', { params });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const createProduct = (formData) =>
  api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProduct = (id, formData) =>
  api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);
export const getMyProducts = () => api.get('/api/products/my/listings');

// Donations
export const createDonationRequest = (data) => api.post('/api/donations', data);
export const getDonationRequests = (type) =>
  api.get('/api/donations', { params: { type } });
export const updateDonationRequest = (id, status) =>
  api.put(`/api/donations/${id}`, { status });

// Purchases
export const createPurchaseRequest = (data) => api.post('/api/purchases', data);
export const getPurchaseRequests = (type) =>
  api.get('/api/purchases', { params: { type } });
export const updatePurchaseRequest = (id, status) =>
  api.put(`/api/purchases/${id}`, { status });

// Services
export const createServiceRequest = (formData) =>
  api.post('/api/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getServiceRequests = (params) => api.get('/api/services', { params });
export const updateServiceRequest = (id, data) => api.put(`/api/services/${id}`, data);

// Favorites
export const toggleFavorite = (productId) => api.post(`/api/favorites/${productId}`);
export const getFavorites = () => api.get('/api/favorites');

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (id) => api.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/api/notifications/read-all');

// Dashboard
export const getDashboard = () => api.get('/api/dashboard');
export const getSustainability = () => api.get('/api/dashboard/sustainability');

// Admin
export const getAdminStats = () => api.get('/api/admin/stats');
export const getAdminUsers = (params) => api.get('/api/admin/users', { params });
export const updateAdminUser = (id, data) => api.put(`/api/admin/users/${id}`, data);
export const getAdminProducts = (params) => api.get('/api/admin/products', { params });
export const removeAdminProduct = (id) => api.delete(`/api/admin/products/${id}`);
export const getAdminReports = () => api.get('/api/admin/reports');
export const exportUsers = () =>
  api.get('/api/admin/export/users', { responseType: 'blob' });


// Pickups
export const getAvailableSlots = (params) => api.get('/api/pickups/slots', { params });
export const createPickup = (data) => api.post('/api/pickups', data);
export const getMyPickups = (tab) => api.get('/api/pickups', { params: { tab } });
export const getPickup = (id) => api.get(`/api/pickups/${id}`);
export const reschedulePickup = (id, data) => api.put(`/api/pickups/${id}/reschedule`, data);
export const cancelPickup = (id) => api.put(`/api/pickups/${id}/cancel`);
export const confirmPickup = (id) => api.put(`/api/pickups/${id}/confirm`);
export const verifyPickup = (token) => api.post('/api/pickups/verify', { token });

// Chat
export const startConversation = (data) => api.post('/api/chat/start', data);
export const getConversations = () => api.get('/api/chat');
export const getMessages = (id) => api.get(`/api/chat/${id}/messages`);
export const sendMessage = (id, text) => api.post(`/api/chat/${id}/messages`, { text });

// Rewards
export const getMyRewards = () => api.get('/api/rewards');
export const getLeaderboard = (params) => api.get('/api/rewards/leaderboard', { params });
