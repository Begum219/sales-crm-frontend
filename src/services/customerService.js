import api from './api';

const customerService = {
  async list(params = {}) {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  async getOne(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/customers', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/customers/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;




