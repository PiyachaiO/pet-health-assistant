import apiClient from './api';

class AdminService {
  // Get pending approvals
  async getPendingApprovals() {
    try {
      const response = await apiClient.get('/admin/pending-approvals');
      return { 
        success: true, 
        appointments: response.data.appointments,
        nutrition_guidelines: response.data.nutrition_guidelines 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pending approvals',
      };
    }
  }

  // Approve appointment
  async approveAppointment(appointmentId, notes) {
    try {
      const response = await apiClient.patch(`/admin/appointments/${appointmentId}/approve`, { notes });
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve appointment',
      };
    }
  }

  // Reject appointment
  async rejectAppointment(appointmentId, notes) {
    try {
      const response = await apiClient.patch(`/admin/appointments/${appointmentId}/reject`, { notes });
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject appointment',
      };
    }
  }

  // Approve nutrition guideline
  async approveNutritionGuideline(guidelineId, notes) {
    try {
      const response = await apiClient.patch(`/admin/nutrition-guidelines/${guidelineId}/approve`, { notes });
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve nutrition guideline',
      };
    }
  }

  // Reject nutrition guideline
  async rejectNutritionGuideline(guidelineId, notes) {
    try {
      const response = await apiClient.patch(`/admin/nutrition-guidelines/${guidelineId}/reject`, { notes });
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject nutrition guideline',
      };
    }
  }

  // Get system statistics
  async getStatistics() {
    try {
      const response = await apiClient.get('/admin/statistics');
      return { 
        success: true, 
        users: response.data.users,
        pets: response.data.pets,
        appointments: response.data.appointments 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, users: response.data.users };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users',
      };
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user role',
      };
    }
  }
}

const adminService = new AdminService();
export default adminService;
