// Export all services
export { default as apiClient, handleApiError } from './api';
export { default as authService } from './authService';
export { default as petService } from './petService';
export { default as appointmentService } from './appointmentService';
export { default as articleService } from './articleService';
export { default as notificationService } from './notificationService';
export { default as nutritionService } from './nutritionService';
export { default as uploadService } from './uploadService';
export { default as adminService } from './adminService';

const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { updateProfile };
