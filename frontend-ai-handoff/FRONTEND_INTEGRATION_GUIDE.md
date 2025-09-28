# 🎨 Frontend Integration Guide - Pet Health Assistant

## 📋 ภาพรวม
คู่มือการเชื่อมต่อ Frontend กับ Backend API สำหรับระบบ Pet Health Assistant

## 🔧 การตั้งค่าเริ่มต้น

### 1. Environment Variables
สร้างไฟล์ `.env` ในโปรเจค Frontend:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_REAL_TIME=true
```

### 2. API Client Setup
```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - เพิ่ม token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - จัดการ error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุ - redirect ไป login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 🔐 Authentication

### 1. Login
```javascript
// auth/login.js
import apiClient from '../api/client';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};
```

### 2. Register
```javascript
// auth/register.js
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return { success: true, user: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed' 
    };
  }
};
```

### 3. Logout
```javascript
// auth/logout.js
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
```

## 👤 User Management

### 1. Get User Profile
```javascript
// users/profile.js
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return { success: true, profile: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get profile' 
    };
  }
};
```

### 2. Update User Profile
```javascript
// users/profile.js
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/profile', profileData);
    return { success: true, profile: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update profile' 
    };
  }
};
```

## 🐕 Pet Management

### 1. Get User's Pets
```javascript
// pets/pets.js
export const getUserPets = async () => {
  try {
    const response = await apiClient.get('/pets');
    return { success: true, pets: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get pets' 
    };
  }
};
```

### 2. Create New Pet
```javascript
// pets/pets.js
export const createPet = async (petData) => {
  try {
    const response = await apiClient.post('/pets', petData);
    return { success: true, pet: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create pet' 
    };
  }
};
```

### 3. Update Pet
```javascript
// pets/pets.js
export const updatePet = async (petId, petData) => {
  try {
    const response = await apiClient.put(`/pets/${petId}`, petData);
    return { success: true, pet: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update pet' 
    };
  }
};
```

### 4. Delete Pet
```javascript
// pets/pets.js
export const deletePet = async (petId) => {
  try {
    await apiClient.delete(`/pets/${petId}`);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete pet' 
    };
  }
};
```

## 📅 Appointments

### 1. Get User's Appointments
```javascript
// appointments/appointments.js
export const getUserAppointments = async () => {
  try {
    const response = await apiClient.get('/appointments');
    return { success: true, appointments: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get appointments' 
    };
  }
};
```

### 2. Create Appointment
```javascript
// appointments/appointments.js
export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post('/appointments', appointmentData);
    return { success: true, appointment: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create appointment' 
    };
  }
};
```

### 3. Update Appointment Status
```javascript
// appointments/appointments.js
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await apiClient.patch(`/appointments/${appointmentId}/status`, {
      status,
    });
    return { success: true, appointment: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update appointment' 
    };
  }
};
```

## 🏥 Health Records

### 1. Get Pet's Health Records
```javascript
// health-records/healthRecords.js
export const getPetHealthRecords = async (petId) => {
  try {
    const response = await apiClient.get(`/pets/${petId}/health-records`);
    return { success: true, healthRecords: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get health records' 
    };
  }
};
```

### 2. Create Health Record
```javascript
// health-records/healthRecords.js
export const createHealthRecord = async (petId, recordData) => {
  try {
    const response = await apiClient.post(`/pets/${petId}/health-records`, recordData);
    return { success: true, healthRecord: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create health record' 
    };
  }
};
```

## 📰 Articles

### 1. Get Published Articles
```javascript
// articles/articles.js
export const getPublishedArticles = async () => {
  try {
    const response = await apiClient.get('/articles');
    return { success: true, articles: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get articles' 
    };
  }
};
```

### 2. Get Article by ID
```javascript
// articles/articles.js
export const getArticleById = async (articleId) => {
  try {
    const response = await apiClient.get(`/articles/${articleId}`);
    return { success: true, article: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get article' 
    };
  }
};
```

## 🔔 Notifications

### 1. Get User's Notifications
```javascript
// notifications/notifications.js
export const getUserNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications');
    return { success: true, notifications: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get notifications' 
    };
  }
};
```

### 2. Mark Notification as Read
```javascript
// notifications/notifications.js
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(`/notifications/${notificationId}/mark-read`);
    return { success: true, notification: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to mark notification as read' 
    };
  }
};
```

### 3. Mark Notification as Completed
```javascript
// notifications/notifications.js
export const markNotificationAsCompleted = async (notificationId) => {
  try {
    const response = await apiClient.patch(`/notifications/${notificationId}/mark-completed`);
    return { success: true, notification: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to mark notification as completed' 
    };
  }
};
```

## 🥗 Nutrition

### 1. Get Approved Nutrition Guidelines
```javascript
// nutrition/nutrition.js
export const getNutritionGuidelines = async () => {
  try {
    const response = await apiClient.get('/nutrition/guidelines');
    return { success: true, guidelines: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get nutrition guidelines' 
    };
  }
};
```

### 2. Get Pet's Nutrition Plans
```javascript
// nutrition/nutrition.js
export const getPetNutritionPlans = async (petId) => {
  try {
    const response = await apiClient.get(`/pets/${petId}/nutrition-plans`);
    return { success: true, nutritionPlans: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get nutrition plans' 
    };
  }
};
```

## 📁 File Upload

### 1. Upload File
```javascript
// upload/upload.js
export const uploadFile = async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return { success: true, file: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to upload file' 
    };
  }
};
```

### 2. File Upload Component
```javascript
// components/FileUpload.jsx
import React, { useState } from 'react';
import { uploadFile } from '../api/upload/upload';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const result = await uploadFile(file, (progress) => {
      setProgress(progress);
    });

    setUploading(false);

    if (result.success) {
      onUploadSuccess?.(result.file);
    } else {
      onUploadError?.(result.error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        accept="image/*,.pdf,.doc,.docx"
      />
      {uploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

## 👨‍⚕️ Veterinarian Features

### 1. Get Veterinarian's Appointments
```javascript
// vet/appointments.js
export const getVetAppointments = async () => {
  try {
    const response = await apiClient.get('/vet/appointments');
    return { success: true, appointments: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get vet appointments' 
    };
  }
};
```

### 2. Create Nutrition Guideline
```javascript
// vet/nutrition.js
export const createNutritionGuideline = async (guidelineData) => {
  try {
    const response = await apiClient.post('/vet/nutrition-guidelines', guidelineData);
    return { success: true, guideline: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create nutrition guideline' 
    };
  }
};
```

## 👨‍💼 Admin Features

### 1. Get Pending Approvals
```javascript
// admin/approvals.js
export const getPendingApprovals = async () => {
  try {
    const response = await apiClient.get('/admin/pending-approvals');
    return { success: true, approvals: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get pending approvals' 
    };
  }
};
```

### 2. Approve Appointment
```javascript
// admin/approvals.js
export const approveAppointment = async (appointmentId, notes) => {
  try {
    const response = await apiClient.patch(`/admin/appointments/${appointmentId}/approve`, {
      notes,
    });
    return { success: true, appointment: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to approve appointment' 
    };
  }
};
```

### 3. Approve Nutrition Guideline
```javascript
// admin/approvals.js
export const approveNutritionGuideline = async (guidelineId, notes) => {
  try {
    const response = await apiClient.patch(`/admin/nutrition-guidelines/${guidelineId}/approve`, {
      notes,
    });
    return { success: true, guideline: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to approve nutrition guideline' 
    };
  }
};
```

## 🔄 State Management

### 1. React Context Setup
```javascript
// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. Protected Route Component
```javascript
// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## 📱 Real-time Features (Optional)

### 1. WebSocket Setup
```javascript
// websocket/websocket.js
class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    const wsUrl = `ws://localhost:5000/ws?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          this.connect(token);
        }
      }, 1000 * this.reconnectAttempts);
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'notification':
        // Handle new notification
        break;
      case 'appointment_update':
        // Handle appointment update
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default new WebSocketClient();
```

## 🎨 UI Components Examples

### 1. Pet Card Component
```javascript
// components/PetCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PetCard = ({ pet }) => {
  return (
    <div className="pet-card">
      <img src={pet.photo_url || '/default-pet.jpg'} alt={pet.name} />
      <h3>{pet.name}</h3>
      <p>{pet.species} • {pet.breed}</p>
      <p>Age: {calculateAge(pet.birth_date)}</p>
      <p>Weight: {pet.weight} kg</p>
      <div className="pet-actions">
        <Link to={`/pets/${pet.id}`}>View Details</Link>
        <Link to={`/pets/${pet.id}/health-records`}>Health Records</Link>
        <Link to={`/pets/${pet.id}/appointments`}>Appointments</Link>
      </div>
    </div>
  );
};

const calculateAge = (birthDate) => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  return `${age} years`;
};

export default PetCard;
```

### 2. Appointment Form Component
```javascript
// components/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { createAppointment } from '../api/appointments/appointments';

const AppointmentForm = ({ pets, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    pet_id: '',
    appointment_type: 'checkup',
    appointment_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await createAppointment(formData);

    if (result.success) {
      onSuccess?.(result.appointment);
      setFormData({
        pet_id: '',
        appointment_type: 'checkup',
        appointment_date: '',
        reason: '',
      });
    } else {
      onError?.(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={formData.pet_id}
        onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
        required
      >
        <option value="">Select Pet</option>
        {pets.map(pet => (
          <option key={pet.id} value={pet.id}>{pet.name}</option>
        ))}
      </select>

      <select
        value={formData.appointment_type}
        onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
        required
      >
        <option value="checkup">Checkup</option>
        <option value="vaccination">Vaccination</option>
        <option value="consultation">Consultation</option>
        <option value="surgery">Surgery</option>
        <option value="emergency">Emergency</option>
      </select>

      <input
        type="datetime-local"
        value={formData.appointment_date}
        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
        required
      />

      <textarea
        placeholder="Reason for appointment"
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
};

export default AppointmentForm;
```

## 🚨 Error Handling

### 1. Global Error Handler
```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `Bad Request: ${data.message}`;
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Forbidden. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return `Validation Error: ${data.message}`;
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return data.message || 'An error occurred.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};
```

### 2. Error Boundary Component
```javascript
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or contact support.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## 📊 Data Validation

### 1. Form Validation Schema
```javascript
// utils/validation.js
import * as yup from 'yup';

export const petSchema = yup.object({
  name: yup.string().required('Pet name is required').max(255),
  species: yup.string().required('Species is required').max(100),
  breed: yup.string().max(100),
  birth_date: yup.date().max(new Date(), 'Birth date cannot be in the future'),
  gender: yup.string().oneOf(['male', 'female', 'unknown']),
  weight: yup.number().positive('Weight must be positive').max(999.99),
  color: yup.string().max(100),
  microchip_id: yup.string().max(50),
});

export const appointmentSchema = yup.object({
  pet_id: yup.string().uuid().required('Pet is required'),
  appointment_type: yup.string().oneOf([
    'checkup', 'vaccination', 'consultation', 'surgery', 'emergency'
  ]).required('Appointment type is required'),
  appointment_date: yup.date().min(new Date(), 'Appointment date must be in the future').required(),
  reason: yup.string().required('Reason is required').max(1000),
});

export const healthRecordSchema = yup.object({
  record_type: yup.string().oneOf([
    'vaccination', 'medication', 'checkup', 'surgery', 'illness', 'injury'
  ]).required('Record type is required'),
  title: yup.string().required('Title is required').max(255),
  description: yup.string().max(2000),
  record_date: yup.date().max(new Date()).required('Record date is required'),
  next_due_date: yup.date().min(yup.ref('record_date')),
  weight: yup.number().positive().max(999.99),
  diagnosis: yup.string().max(2000),
  treatment: yup.string().max(2000),
  notes: yup.string().max(2000),
});
```

## 🎯 Best Practices

### 1. Loading States
```javascript
// hooks/useLoading.js
import { useState } from 'react';

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = async (asyncFunction) => {
    setLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { loading, withLoading };
};
```

### 2. Optimistic Updates
```javascript
// hooks/useOptimisticUpdate.js
import { useState } from 'react';

export const useOptimisticUpdate = () => {
  const [optimisticData, setOptimisticData] = useState(null);

  const optimisticUpdate = (data, updateFunction) => {
    setOptimisticData(data);
    
    return updateFunction().finally(() => {
      setOptimisticData(null);
    });
  };

  return { optimisticData, optimisticUpdate };
};
```

### 3. Caching Strategy
```javascript
// utils/cache.js
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export default new ApiCache();
```

## 📱 Mobile Considerations

### 1. Responsive Design
```css
/* styles/responsive.css */
.pet-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0.5rem;
}

@media (max-width: 768px) {
  .pet-card {
    margin: 0.25rem;
    padding: 0.75rem;
  }
  
  .pet-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .pet-actions a {
    width: 100%;
    text-align: center;
  }
}
```

### 2. Touch-friendly Components
```javascript
// components/TouchableButton.jsx
import React from 'react';

const TouchableButton = ({ children, onClick, disabled, ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: '44px', // iOS minimum touch target
        minWidth: '44px',
        padding: '12px 16px',
        fontSize: '16px', // Prevent zoom on iOS
        border: 'none',
        borderRadius: '8px',
        backgroundColor: disabled ? '#ccc' : '#007bff',
        color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'manipulation', // Optimize for touch
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default TouchableButton;
```

## 🔧 Development Tools

### 1. API Mocking (Development)
```javascript
// mocks/apiMock.js
export const mockApiResponse = (endpoint, data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200 });
    }, delay);
  });
};

// Usage in development
if (process.env.NODE_ENV === 'development') {
  // Mock API responses for testing
  window.mockApi = mockApiResponse;
}
```

### 2. Debug Utilities
```javascript
// utils/debug.js
export const debugApi = (apiClient) => {
  if (process.env.NODE_ENV === 'development') {
    apiClient.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
        return config;
      }
    );

    apiClient.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
      }
    );
  }
};
```

## 📚 Additional Resources

### 1. Useful Libraries
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0",
    "yup": "^1.3.0",
    "react-hook-form": "^7.48.0",
    "date-fns": "^2.30.0",
    "react-query": "^3.39.0",
    "zustand": "^4.4.0"
  }
}
```

### 2. Testing Setup
```javascript
// tests/api.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createPet, getUserPets } from '../api/pets/pets';

// Mock API client
jest.mock('../api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('Pet API', () => {
  test('should create pet successfully', async () => {
    const mockPet = { id: '1', name: 'Buddy', species: 'Dog' };
    apiClient.post.mockResolvedValue({ data: mockPet });

    const result = await createPet({ name: 'Buddy', species: 'Dog' });
    
    expect(result.success).toBe(true);
    expect(result.pet).toEqual(mockPet);
  });
});
```

## 🚀 Deployment Checklist

### 1. Environment Variables
- [ ] Set `REACT_APP_API_BASE_URL` to production API URL
- [ ] Configure Supabase production project
- [ ] Set up SSL certificates
- [ ] Configure CORS settings

### 2. Build Optimization
- [ ] Enable code splitting
- [ ] Optimize bundle size
- [ ] Configure caching headers
- [ ] Set up CDN for static assets

### 3. Performance Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Monitor API response times
- [ ] Set up user feedback collection

---

## 📞 Support

หากมีคำถามหรือปัญหาการใช้งาน API สามารถติดต่อได้ที่:
- **Email**: support@pethealth.com
- **Documentation**: [API Documentation](https://docs.pethealth.com)
- **GitHub Issues**: [Repository Issues](https://github.com/pethealth/backend/issues)

---

**หมายเหตุ**: คู่มือนี้ครอบคลุมการใช้งาน API หลักทั้งหมด ควรปรับแต่งตามความต้องการเฉพาะของโปรเจค Frontend ของคุณ
