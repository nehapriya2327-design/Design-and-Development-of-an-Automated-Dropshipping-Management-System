import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 60000, // 60 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }
    return config;
});

// Global response handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // Handle common errors
        if (status === 401) {
            console.warn('Unauthorized - maybe redirect to login?');
            // Optionally clear tokens or redirect
        } else if (status === 500) {
            console.error('Server error:', error.response.data?.message);
        }

        return Promise.reject(error);
    }
);

// Handle 401 Unauthorized globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/'; // or toast + redirect
        }
        return Promise.reject(error);
    }
);

export default api;
