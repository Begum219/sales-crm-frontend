import api from './api';

const dealService = {
  async list(params = {}) {
    const response = await api.get('/deals', { params });
    return response.data;
  },

  async getOne(id) {
    const response = await api.get(`/deals/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/deals', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/deals/${id}`, payload);
    return response.data;
  },

  async updateStage(id, status) {
    const response = await api.put(`/deals/${id}/stage`, { status });
    return response.data;
  },

  async convertFromLead(leadId, payload) {
    const response = await api.post(`/deals/convert-from-lead/${leadId}`, payload);
    return response.data;
  },
};

export default dealService;