import axios from 'axios';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000, // เพิ่ม timeout เป็น 15 วินาที
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url} (token included)`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url} (no token)`);
        }
      }
    }
    
    // Add request ID for tracking
    // config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`API Error [${error.config?.url}]:`, {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API Error: No response received', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error: Request setup failed', error.message);
      }
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Global error handler
export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Show permission denied message
    showNotification('คุณไม่มีสิทธิ์ในการดำเนินการนี้', 'error');
  } else if (error.response?.status === 422) {
    // Show validation errors
    const errors = error.response.data.errors;
    showValidationErrors(errors);
  } else {
    // Show generic error
    showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
  }
};

// Simple notification function (can be replaced with your preferred notification library)
const showNotification = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  // You can integrate with toast libraries like react-toastify here
};

const showValidationErrors = (errors) => {
  if (errors && typeof errors === 'object') {
    Object.values(errors).forEach(error => {
      showNotification(error, 'error');
    });
  }
};

export default apiClient;
