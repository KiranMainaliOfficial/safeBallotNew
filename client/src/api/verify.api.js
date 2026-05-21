import api from './axios';

export const verifyElectionApi = (id) => api.get(`/verify/election/${id}`);
export const verifyReceiptApi = (rid) => api.get(`/verify/receipt/${rid}`);