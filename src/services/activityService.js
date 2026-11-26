import api from './api';

const activityService = {
  async list(params = {}) {
    const response = await api.get('/customers-activities', { params });
    return response.data;
  },
  async create(data) {
    const response = await api.post('/customers-activities', data);
    return response.data;
  },
  async remove(id) {
    await api.delete(`/customers-activities/${id}`);
  },
};

export default activityService;