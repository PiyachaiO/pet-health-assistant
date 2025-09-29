import { DATE_FORMATS, VALIDATION } from './constants';

// Date formatting helpers
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  switch (format) {
    case DATE_FORMATS.DISPLAY:
      return `${day}/${month}/${year}`;
    case DATE_FORMATS.API:
      return `${year}-${month}-${day}`;
    case DATE_FORMATS.DATETIME:
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case DATE_FORMATS.API_DATETIME:
      return d.toISOString();
    default:
      return `${day}/${month}/${year}`;
  }
};

// Validation helpers
export const validateEmail = (email) => {
  return VALIDATION.EMAIL.test(email);
};

export const validatePhone = (phone) => {
  return VALIDATION.PHONE.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

export const validateName = (name) => {
  return name && 
         name.length >= VALIDATION.NAME_MIN_LENGTH && 
         name.length <= VALIDATION.NAME_MAX_LENGTH;
};

// String helpers
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    
    // Handle date sorting
    if (aVal instanceof Date && bVal instanceof Date) {
      aVal = aVal.getTime();
      bVal = bVal.getTime();
    }
    
    // Handle string sorting
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (order === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

// Object helpers
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Local storage helpers
export const setStorageItem = (key, value) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const removeStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }
};

// Error handling helpers
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

// File helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// URL helpers
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle helper
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Color helpers
export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    scheduled: 'blue',
    confirmed: 'green',
    completed: 'gray',
    cancelled: 'red',
    low: 'gray',
    medium: 'yellow',
    high: 'orange',
    urgent: 'red',
  };
  
  return colors[status] || 'gray';
};

// Role helpers
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    user: 1,
    veterinarian: 2,
    admin: 3,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Notification helpers
export const getNotificationIcon = (type) => {
  const icons = {
    vaccination_due: 'syringe',
    medication_reminder: 'pill',
    appointment_reminder: 'calendar',
    checkup_due: 'stethoscope',
  };
  
  return icons[type] || 'bell';
};
