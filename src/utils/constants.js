// User Roles
export const USER_ROLES = {
  USER: 'user',
  VETERINARIAN: 'veterinarian',
  ADMIN: 'admin',
};

// Pet Species
export const PET_SPECIES = {
  DOG: 'Dog',
  CAT: 'Cat',
  BIRD: 'Bird',
  FISH: 'Fish',
  RABBIT: 'Rabbit',
  HAMSTER: 'Hamster',
  OTHER: 'Other',
};

// Pet Gender
export const PET_GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
};

// Appointment Types
export const APPOINTMENT_TYPES = {
  CHECKUP: 'checkup',
  VACCINATION: 'vaccination',
  CONSULTATION: 'consultation',
  SURGERY: 'surgery',
  EMERGENCY: 'emergency',
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Health Record Types
export const HEALTH_RECORD_TYPES = {
  VACCINATION: 'vaccination',
  MEDICATION: 'medication',
  CHECKUP: 'checkup',
  SURGERY: 'surgery',
  ILLNESS: 'illness',
  INJURY: 'injury',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  VACCINATION_DUE: 'vaccination_due',
  MEDICATION_REMINDER: 'medication_reminder',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  CHECKUP_DUE: 'checkup_due',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Article Categories
export const ARTICLE_CATEGORIES = {
  HEALTH: 'health',
  NUTRITION: 'nutrition',
  BEHAVIOR: 'behavior',
  CARE: 'care',
  NEWS: 'news',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 10,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CONFIRM_EMAIL: '/auth/confirm-email',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  PETS: {
    LIST: '/pets',
    DETAIL: (id) => `/pets/${id}`,
    HEALTH_RECORDS: (id) => `/pets/${id}/health-records`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    VET: '/appointments/vet',
    DETAIL: (id) => `/appointments/${id}`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
  },
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (id) => `/articles/${id}`,
    ADMIN_ALL: '/articles/admin/all',
    PUBLISH: (id) => `/articles/${id}/publish`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread/count',
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    ADMIN_CREATE: '/notifications/admin/create',
  },
  NUTRITION: {
    GUIDELINES: '/nutrition/guidelines',
    GUIDELINE_DETAIL: (id) => `/nutrition/guidelines/${id}`,
    RECOMMENDATIONS: '/nutrition/recommendations',
    RECOMMENDATION_DETAIL: (id) => `/nutrition/recommendations/${id}`,
    PUBLISH_GUIDELINE: (id) => `/nutrition/guidelines/${id}/publish`,
  },
  UPLOAD: {
    SINGLE: '/upload',
    MULTIPLE: '/upload/multiple',
    DELETE: (filename) => `/upload/${filename}`,
  },
  ADMIN: {
    PENDING_APPROVALS: '/admin/pending-approvals',
    APPROVE_APPOINTMENT: (id) => `/admin/appointments/${id}/approve`,
    REJECT_APPOINTMENT: (id) => `/admin/appointments/${id}/reject`,
    APPROVE_NUTRITION: (id) => `/admin/nutrition-guidelines/${id}/approve`,
    REJECT_NUTRITION: (id) => `/admin/nutrition-guidelines/${id}/reject`,
    STATISTICS: '/admin/statistics',
    USERS: '/admin/users',
    UPDATE_USER_ROLE: (id) => `/admin/users/${id}/role`,
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Validation Rules
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9+\-\s()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};
