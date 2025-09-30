import apiClient from './api';

class NutritionService {
  // Get approved nutrition guidelines
  async getGuidelines() {
    try {
      const response = await apiClient.get('/nutrition/guidelines');
      return { success: true, guidelines: response.data.guidelines };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch nutrition guidelines',
      };
    }
  }

  // Get specific nutrition guideline
  async getGuideline(guidelineId) {
    try {
      const response = await apiClient.get(`/nutrition/guidelines/${guidelineId}`);
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch nutrition guideline',
      };
    }
  }

  // Get nutrition recommendations for pets
  async getRecommendations() {
    try {
      const response = await apiClient.get('/nutrition/recommendations');
      return { success: true, nutritionPlans: response.data.nutritionPlans };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch nutrition recommendations',
      };
    }
  }

  // Create nutrition recommendation
  async createRecommendation(recommendationData) {
    try {
      const response = await apiClient.post('/nutrition/recommendations', recommendationData);
      return { success: true, nutritionPlan: response.data.nutritionPlan };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create nutrition recommendation',
      };
    }
  }

  // Update nutrition recommendation
  async updateRecommendation(recommendationId, recommendationData) {
    try {
      const response = await apiClient.put(`/nutrition/recommendations/${recommendationId}`, recommendationData);
      return { success: true, nutritionPlan: response.data.nutritionPlan };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update nutrition recommendation',
      };
    }
  }

  // Delete nutrition recommendation
  async deleteRecommendation(recommendationId) {
    try {
      await apiClient.delete(`/nutrition/recommendations/${recommendationId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete nutrition recommendation',
      };
    }
  }

  // Create nutrition guideline (Vet/Admin only)
  async createGuideline(guidelineData) {
    try {
      const response = await apiClient.post('/nutrition/guidelines', guidelineData);
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create nutrition guideline',
      };
    }
  }

  // Update nutrition guideline (Vet/Admin only)
  async updateGuideline(guidelineId, guidelineData) {
    try {
      const response = await apiClient.put(`/nutrition/guidelines/${guidelineId}`, guidelineData);
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update nutrition guideline',
      };
    }
  }

  // Publish nutrition guideline (Admin only)
  async publishGuideline(guidelineId) {
    try {
      const response = await apiClient.patch(`/nutrition/guidelines/${guidelineId}/publish`);
      return { success: true, guideline: response.data.guideline };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to publish nutrition guideline',
      };
    }
  }

  // Delete nutrition guideline (Vet/Admin only)
  async deleteGuideline(guidelineId) {
    try {
      await apiClient.delete(`/nutrition/guidelines/${guidelineId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete nutrition guideline',
      };
    }
  }
}

const nutritionService = new NutritionService();
export default nutritionService;
