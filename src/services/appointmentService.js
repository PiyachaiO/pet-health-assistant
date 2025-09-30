import apiClient from './api';

class AppointmentService {
  // Get all appointments for current user
  async getAppointments() {
    try {
      const response = await apiClient.get('/appointments');
      // รองรับทั้งกรณี backend คืน { appointments: [...] } หรือ [...] ตรงๆ
      const appointments = Array.isArray(response.data)
        ? response.data
        : response.data.appointments || response.data.data || [];
  return { success: true, appointments };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointments',
      };
    }
  }

  // Get appointments for veterinarian
  async getVetAppointments() {
    try {
      const response = await apiClient.get('/appointments/vet');
      return { success: true, appointments: response.data.appointments };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch vet appointments',
      };
    }
  }

  // Get specific appointment by ID
  async getAppointment(appointmentId) {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment',
      };
    }
  }

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create appointment',
      };
    }
  }

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, appointmentData);
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update appointment',
      };
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
      return { success: true, appointment: response.data.appointment };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel appointment',
      };
    }
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete appointment',
      };
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;

export const getAppointments = async () => {
  try {
    const response = await apiClient.get('/appointments');
    // รองรับทั้งกรณี backend คืน { appointments: [...] } หรือ [...] ตรงๆ
    const appointments = Array.isArray(response.data)
      ? response.data
      : response.data.appointments || response.data.data || [];
  return { success: true, appointments };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
  }
};
