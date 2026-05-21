import api from './axios';

export const fraudListApi = () => api.get('/admin/fraud');
export const updateFraudApi = (id, status) =>
    api.patch(`/admin/fraud/${id}`, { status });
export const logsApi = () => api.get('/admin/logs');