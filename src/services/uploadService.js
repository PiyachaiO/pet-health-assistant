import apiClient from './api';

class UploadService {
  // Upload single file
  async uploadFile(file, onProgress) {
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
        error: error.response?.data?.message || 'Failed to upload file',
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, onProgress) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.post('/upload/multiple', formData, {
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

      return { success: true, files: response.data.files };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload files',
      };
    }
  }

  // Get uploaded files
  async getUploadedFiles() {
    try {
      const response = await apiClient.get('/upload');
      return { success: true, files: response.data.files };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch uploaded files',
      };
    }
  }

  // Delete file
  async deleteFile(filename) {
    try {
      await apiClient.delete(`/upload/${filename}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete file',
      };
    }
  }

  // Validate file before upload
  validateFile(file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']) {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSize / 1024 / 1024}MB)`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('ประเภทไฟล์ไม่ถูกต้อง');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get file preview URL
  getFilePreviewUrl(file) {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }
}

const uploadService = new UploadService();
export default uploadService;
