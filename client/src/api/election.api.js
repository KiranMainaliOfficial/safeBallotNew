import api from './axios';

export const listElectionsApi = () => api.get('/elections');
export const getElectionApi = (id) => api.get(`/elections/${id}`);
export const createElectionApi = (payload) => api.post('/elections', payload);
export const setStatusApi = (id, status) =>
    api.patch(`/elections/${id}/status`, { status });
export const addCandidateApi = (id, payload) =>
    api.post(`/elections/${id}/candidates`, payload);
export const resultsApi = (id) => api.get(`/votes/results/${id}`);