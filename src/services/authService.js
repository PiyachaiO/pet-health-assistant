import apiClient from './api';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      
      return { success: true, user, access_token };
    } catch (error) {
      console.error("Full login error response:", error.response);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { access_token, user } = response.data;
      
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      
      return { success: true, user, access_token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/users/profile');
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
      };
    }
  }

  // This function already exists, but I will ensure it is correct.
  // No changes needed if it's already there and correct.
  // The existing updateProfile function seems to be targeting /users/profile
  // which is correct according to backend/routes/users.js
  // However, the backend returns the user object directly, not nested under `user`.
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return { success: true, user: response.data }; // Corrected to response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      };
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      const { access_token, refresh_token } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      
      return { success: true, access_token, refresh_token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
      };
    }
  }

  // Confirm email
  async confirmEmail(email) {
    try {
      const response = await apiClient.post('/auth/confirm-email', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email confirmation failed',
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }
}

const authService = new AuthService();
export default authService;
