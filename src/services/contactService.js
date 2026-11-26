import api from './api';

const contactService = {
  async list(params = {}) {
    const response = await api.get('/contacts', { params });
    return response.data;
  },
  async create(data) {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  async remove(id) {
    await api.delete(`/contacts/${id}`);
  },
};

export default contactService;