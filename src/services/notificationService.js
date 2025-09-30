import apiClient from './api';

class NotificationService {
  // Get all notifications for current user
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      // Backend returns array directly, not wrapped in notifications field
      return { success: true, notifications: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications',
      };
    }
  }

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread/count');
      return { success: true, count: response.data.count };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread count',
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return { success: true, notification: response.data.notification };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read',
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return { success: true, message: response.data.message, count: response.data.count };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read',
      };
    }
  }

  // Delete specific notification
  async deleteNotification(notificationId) {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification',
      };
    }
  }

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      await apiClient.delete('/notifications');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete all notifications',
      };
    }
  }

  // Create notification (Admin only)
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post('/notifications/admin/create', notificationData);
      return { success: true, notification: response.data.notification };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create notification',
      };
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;

export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications');
    // Backend returns array directly, not wrapped in notifications field
    return { success: true, notifications: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch notifications',
    };
  }
};
