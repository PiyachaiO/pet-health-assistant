import { useState, useCallback } from 'react';
import { handleApiError } from '../services';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showError = true, 
      onSuccess, 
      onError, 
      resetError = true 
    } = options;

    if (resetError) {
      setError(null);
    }
    
    setLoading(true);

    try {
      const result = await apiCall();
      
      // ✅ **แก้ไขจุดนี้:** เพิ่มเงื่อนไข || Array.isArray(result)
      // เพื่อให้รองรับ API ที่คืนค่าเป็น Array ตรงๆ ได้
      if (result.success === true || Array.isArray(result)) {
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        const errorMessage = result.error || 'เกิดข้อผิดพลาด';
        setError(errorMessage);
        
        if (showError) {
          handleApiError({ response: { data: { message: errorMessage } } });
        }
        
        if (onError) {
          onError(result);
        }
        
        return result;
      }
    } catch (err) {
      const errorMessage = err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setError(errorMessage);
      
      if (showError) {
        handleApiError(err);
      }
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    resetError,
  };
};