import api from './api';

const offerService = {
  async list(params = {}) {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  async getOne(id) {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/offers', payload);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/offers/${id}/status`, { status });
    return response.data;
  },
};

export default offerService;