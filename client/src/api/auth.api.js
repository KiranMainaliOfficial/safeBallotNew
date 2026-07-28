import api from './axios';

export const registerApi = (payload) => api.post('/auth/register', payload);
export const verifyOtpApi = (payload) => api.post('/auth/verify-otp', payload);
export const loginApi = (payload) => api.post('/auth/login', payload);
export const logoutApi = () => api.post('/auth/logout');
export const getMeApi = () => api.get('/auth/me');
export const submitKycApi = (payload) => api.post('/auth/kyc', payload);
export const verifyFaceApi = (payload) => api.post('/auth/verify-face', payload);