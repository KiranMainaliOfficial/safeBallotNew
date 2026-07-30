import api from './axios';

export const submitContactApi = (payload) => api.post('/contact', payload);
