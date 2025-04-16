import axios from 'axios';

// Create an axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');

      // If the token exists, add it to the Authorization header
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Always return the modified config
      return config;
    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
);
