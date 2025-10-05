import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { playNotificationSound, playUrgentSound } from '../../public/sounds/notification-sound';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user || typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot connect to Socket.IO');
      return;
    }

    // Validate token format
    if (!token.includes('.')) {
      console.error('Invalid token format');
      return;
    }

    console.log('Connecting to Socket.IO with token:', token.substring(0, 20) + '...');

    // Create Socket.IO connection
    const socketInstance = io(process.env.REACT_APP_API_URL.replace('/api', ''), {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('connected', (data) => {
      console.log('📡 Received connection confirmation:', data);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      console.error('Error details:', error);
      
      // If authentication error, try to re-login
      if (error.message.includes('Authentication') || error.message.includes('Invalid token')) {
        console.warn('Authentication failed. Please login again.');
        // Optional: You can redirect to login page here
        // window.location.href = '/login';
      }
      
      setIsConnected(false);
    });

    // Notification event listeners
    setupNotificationListeners(socketInstance);

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting Socket.IO');
      socketInstance.disconnect();
    };
  }, [user]);

  // Setup notification listeners
  const setupNotificationListeners = (socketInstance) => {
    // ==================== USER NOTIFICATIONS ====================
    
    // Appointment notifications
    socketInstance.on('notification:appointment', (data) => {
      console.log('📬 New appointment notification:', data);
      addNotification(data);
      showToast('การแจ้งเตือนนัดหมาย', data.message);
    });

    // Vet response
    socketInstance.on('notification:vet_response', (data) => {
      console.log('📬 Vet response notification:', data);
      addNotification(data);
      showToast('สัตวแพทย์ตอบกลับ', data.message);
    });

    // Nutrition plan
    socketInstance.on('notification:nutrition_plan', (data) => {
      console.log('📬 Nutrition plan notification:', data);
      addNotification(data);
      showToast('แผนโภชนาการใหม่', data.message);
    });

    // Health record
    socketInstance.on('notification:health_record', (data) => {
      console.log('📬 Health record notification:', data);
      addNotification(data);
    });

    // Vaccination reminder
    socketInstance.on('notification:vaccination', (data) => {
      console.log('📬 Vaccination reminder:', data);
      addNotification(data);
      showToast('เตือนฉีดวัคซีน', data.message, 'warning');
    });

    // Medication reminder
    socketInstance.on('notification:medication', (data) => {
      console.log('📬 Medication reminder:', data);
      addNotification(data);
      showToast('เตือนให้ยา', data.message, 'warning');
    });

    // ==================== VET NOTIFICATIONS ====================
    
    // New appointment for vet
    socketInstance.on('notification:new_appointment', (data) => {
      console.log('📬 New appointment for vet:', data);
      console.log('📬 Notification details:', {
        id: data.id,
        title: data.title,
        message: data.message,
        user_id: data.user_id,
        pet_id: data.pet_id,
        created_at: data.created_at
      });
      addNotification(data);
      showToast('นัดหมายใหม่', data.message, 'info');
    });

    // Appointment cancelled
    socketInstance.on('notification:appointment_cancelled', (data) => {
      console.log('📬 Appointment cancelled:', data);
      addNotification(data);
      showToast('นัดหมายถูกยกเลิก', data.message);
    });

    // Appointment updated
    socketInstance.on('notification:appointment_updated', (data) => {
      console.log('📬 Appointment updated:', data);
      addNotification(data);
      showToast('นัดหมายถูกแก้ไข', data.message);
    });

    // Urgent notification for vet
    socketInstance.on('notification:urgent', (data) => {
      console.log('📬 Urgent notification:', data);
      addNotification(data);
      showToast('การแจ้งเตือนด่วน', data.message, 'error');
    });

    // Article published
    socketInstance.on('notification:article_published', (data) => {
      console.log('📬 Article published:', data);
      addNotification(data);
      showToast('บทความได้รับการเผยแพร่', data.message, 'success');
    });

    // Broadcast to all vets
    socketInstance.on('notification:new_appointment_broadcast', (data) => {
      console.log('📬 New appointment broadcast:', data);
      // Optional: Show less intrusive notification for broadcast
    });

    // ==================== ADMIN NOTIFICATIONS ====================
    
    // New user registered
    socketInstance.on('notification:new_user', (data) => {
      console.log('📬 New user registered:', data);
      addNotification(data);
      showToast('ผู้ใช้ใหม่', data.message);
    });

    // New vet application
    socketInstance.on('notification:new_vet_application', (data) => {
      console.log('📬 New vet application:', data);
      addNotification(data);
      showToast('สัตวแพทย์สมัครใหม่', data.message, 'warning');
    });

    // Article pending approval
    socketInstance.on('notification:article_pending', (data) => {
      console.log('📬 Article pending:', data);
      addNotification(data);
      showToast('บทความรอการอนุมัติ', data.message);
    });

    // Nutrition pending approval
    socketInstance.on('notification:nutrition_pending', (data) => {
      console.log('📬 Nutrition pending:', data);
      addNotification(data);
      showToast('Nutrition Guideline รอการอนุมัติ', data.message);
    });

    // System alert
    socketInstance.on('notification:system_alert', (data) => {
      console.log('📬 System alert:', data);
      addNotification(data);
      showToast('การแจ้งเตือนระบบ', data.message, 'error');
    });

    // User report
    socketInstance.on('notification:user_report', (data) => {
      console.log('📬 User report:', data);
      addNotification(data);
      showToast('รายงานใหม่', data.message, 'warning');
    });

    // ==================== BROADCAST NOTIFICATIONS ====================
    
    // New article (all users)
    socketInstance.on('notification:new_article', (data) => {
      console.log('📬 New article broadcast:', data);
      showToast('บทความใหม่', data.message);
    });

    // Announcement (all users)
    socketInstance.on('notification:announcement', (data) => {
      console.log('📬 Announcement:', data);
      showToast('ประกาศ', data.message, 'info');
    });
  };

  // Add notification to state
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Show toast notification using react-hot-toast
  const showToast = (title, message, type = 'info') => {
    console.log(`🔔 [${type.toUpperCase()}] ${title}: ${message}`);
    
    // Play notification sound based on type
    try {
      if (type === 'error') {
        playUrgentSound(); // Double beep for errors
      } else {
        playNotificationSound(type); // Single beep for others
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
    
    const toastMessage = (
      <div>
        <strong>{title}</strong>
        <p className="text-sm">{message}</p>
      </div>
    );

    switch (type) {
      case 'success':
        toast.success(toastMessage, {
          duration: 5000,
          position: 'top-right',
          icon: '✅',
        });
        break;
      case 'error':
        toast.error(toastMessage, {
          duration: 6000,
          position: 'top-right',
          icon: '❌',
        });
        break;
      case 'warning':
        toast(toastMessage, {
          duration: 5000,
          position: 'top-right',
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
        break;
      case 'info':
      default:
        toast(toastMessage, {
          duration: 5000,
          position: 'top-right',
          icon: '📢',
          style: {
            background: '#DBEAFE',
            color: '#1E40AF',
          },
        });
        break;
    }
  };

  // Ping server to keep connection alive
  useEffect(() => {
    if (!socket || !isConnected) return;

    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000); // Every 30 seconds

    socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data.timestamp);
    });

    return () => {
      clearInterval(pingInterval);
      socket.off('pong');
    };
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

