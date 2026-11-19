import api from './api';

const leadService = {
  async list(params = {}) {
    const response = await api.get('/leads', { params });
    return response.data; // { data, meta }
  },

  async getOne(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/leads', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/leads/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;