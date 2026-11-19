import api from './api';

export const authService = {
  async login({ companySlug, email, password }) {
    const response = await api.post('/auth/login', { companySlug, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async register({ companyName, companySlug, email, password }) {
    const response = await api.post('/auth/register', { companyName, companySlug, email, password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;