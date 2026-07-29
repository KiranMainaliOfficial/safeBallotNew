import api from './axios';

export const listElectionsApi = () => api.get('/elections');
export const getElectionApi = (id) => api.get(`/elections/${id}`);
export const createElectionApi = (payload) => api.post('/elections', payload);
export const setStatusApi = (id, status) =>
    api.patch(`/elections/${id}/status`, { status });
export const updateElectionApi = (id, payload) =>
    api.put(`/elections/${id}`, payload);
export const deleteElectionApi = (id) =>
    api.delete(`/elections/${id}`);
export const addCandidateApi = (id, payload) =>
    api.post(`/elections/${id}/candidates`, payload);
export const updateCandidateApi = (electionId, candidateId, payload) =>
    api.put(`/elections/${electionId}/candidates/${candidateId}`, payload);
export const deleteCandidateApi = (electionId, candidateId) =>
    api.delete(`/elections/${electionId}/candidates/${candidateId}`);
export const resultsApi = (id) => api.get(`/votes/results/${id}`);