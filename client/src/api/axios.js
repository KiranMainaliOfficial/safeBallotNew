import axios from 'axios';
import { useAuth } from '../store/authStore';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const { token } = useAuth.getState();

    console.log("TOKEN:", token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const fp = localStorage.getItem('device_fp');
    if (fp) {
        config.headers['X-Device-Fp'] = fp;
    }

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