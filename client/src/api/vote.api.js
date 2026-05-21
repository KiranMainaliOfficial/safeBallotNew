import api from './axios';

export const castVoteApi = (payload) => api.post('/votes', payload);