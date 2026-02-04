import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333',
});

// Request interceptor for API tokens
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
