import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// Request interceptor to attach JWT token
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

// Response interceptor to handle global errors (401, 403, and automatic Toast broadcasts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      let errorMsg = data?.detail || "An unexpected error occurred.";
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0].msg;
      }
      
      if (status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: "Access Denied: You do not have permission to execute this.", type: 'error' } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: errorMsg, type: 'error' } 
        }));
      }
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Network connection lost. Please check your internet.", type: 'error' } 
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
