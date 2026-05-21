import api from './axios';

export const registerApi = (payload) => api.post('/auth/register', payload);
export const verifyOtpApi = (payload) => api.post('/auth/verify-otp', payload);
export const loginApi = (payload) => api.post('/auth/login', payload);
export const logoutApi = () => api.post('/auth/logout');