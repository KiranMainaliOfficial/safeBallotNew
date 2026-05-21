import axios from 'axios';
import { useAuth } from '../store/authStore';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const { token } = useAuth.getState();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-device-fp'] = localStorage.getItem('device_fp') || '';
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) useAuth.getState().logout();
        return Promise.reject(err);
    }
);

export default api;