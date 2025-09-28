import apiClient from './api';

class PetService {
  // Get all pets for current user
  async getPets() {
    try {
      const response = await apiClient.get('/pets');
      // รองรับทั้งกรณี backend คืน { pets: [...] } หรือ [...] ตรงๆ
      const pets = Array.isArray(response.data)
        ? response.data
        : response.data.pets || response.data.data || [];
  return { success: true, pets };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pets',
      };
    }
  }

  // Get specific pet by ID
  async getPet(petId) {
    try {
      const response = await apiClient.get(`/pets/${petId}`);
      return { success: true, pet: response.data.pet };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pet',
      };
    }
  }

  // Create new pet
  async createPet(petData) {
    try {
      const response = await apiClient.post('/pets', petData);
      return { success: true, pet: response.data.pet };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create pet',
      };
    }
  }

  // Update pet
  async updatePet(petId, petData) {
    try {
      const response = await apiClient.put(`/pets/${petId}`, petData);
      return { success: true, pet: response.data.pet };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update pet',
      };
    }
  }

  // Delete pet
  async deletePet(petId) {
    try {
      await apiClient.delete(`/pets/${petId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete pet',
      };
    }
  }

  // Get health records for a pet
  async getHealthRecords(petId) {
    try {
      const response = await apiClient.get(`/pets/${petId}/health-records`);
      return { success: true, healthRecords: response.data.healthRecords };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch health records',
      };
    }
  }

  // Create health record for a pet
  async createHealthRecord(petId, recordData) {
    try {
      const response = await apiClient.post(`/pets/${petId}/health-records`, recordData);
      return { success: true, healthRecord: response.data.healthRecord };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create health record',
      };
    }
  }
}

const petService = new PetService();
export default petService;

export const getPets = async () => {
  try {
    const response = await apiClient.get('/pets');
    // รองรับทั้งกรณี backend คืน { pets: [...] } หรือ [...] ตรงๆ
    const pets = Array.isArray(response.data)
      ? response.data
      : response.data.pets || response.data.data || [];
    return { pets };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch pets',
    };
  }
};
