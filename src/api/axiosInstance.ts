import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add Store ID for multi-tenancy
      const cartStorage = localStorage.getItem('cart-storage');
      if (cartStorage) {
        try {
          const { state } = JSON.parse(cartStorage);
          if (state?.storeConfig?.id) {
            config.headers['x-store-id'] = state.storeConfig.id;
          }
        } catch (e) {
          console.error('Error parsing cart-storage', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Handle 401 Unauthorized (e.g., redirect to login or clear token)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        // Optional: window.location.href = '/login';
      }
    }

    if (error && typeof error === 'object') {
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
