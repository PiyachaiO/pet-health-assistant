"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"
import apiClient from "../services/api"
import { Bell, Check, Clock, AlertCircle, Calendar, User, FileText, Wifi, WifiOff } from "lucide-react"

const Notifications = () => {
  const { user } = useAuth()
  const { notifications: socketNotifications, unreadCount, markAsRead: socketMarkAsRead, markAllAsRead, isConnected } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  // Merge Socket.IO notifications with API notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Update notifications when Socket.IO receives new ones
  useEffect(() => {
    if (socketNotifications.length > 0) {
      setNotifications((prev) => {
        // Merge and deduplicate
        const merged = [...socketNotifications, ...prev]
        const unique = merged.filter((notification, index, self) =>
          index === self.findIndex((n) => n.id === notification.id)
        )
        // Sort by created_at (newest first)
        return unique.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })
      })
    }
  }, [socketNotifications])

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications")
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      // Also mark as read in Socket context
      socketMarkAsRead(notificationId)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all as read in API
      const unreadNotifications = notifications.filter(n => !n.is_read)
      await Promise.all(
        unreadNotifications.map(n => apiClient.patch(`/notifications/${n.id}/read`))
      )
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
      // Also mark all as read in Socket context
      markAllAsRead()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const markAsCompleted = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/mark-completed`)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, is_completed: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as completed:", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.is_read
      case "completed":
        return notification.is_completed
      case "pending":
        return !notification.is_completed
      case "urgent":
        return notification.priority === "high" || notification.priority === "urgent"
      case "updates":
        return notification.notification_type === "appointment_reminder"
      default:
        return true
    }
  })

  const getNotificationIcon = (notification) => {
    // สำหรับสัตวแพทย์: แสดงไอคอนตามประเภทการแจ้งเตือน
    if (user?.role === "veterinarian") {
      switch (notification.notification_type) {
        case "appointment_reminder":
          return <Calendar className="h-5 w-5 text-blue-500" />
        case "vaccination_due":
        case "medication_reminder":
        case "checkup_due":
          return <FileText className="h-5 w-5 text-green-500" />
        default:
          return getPriorityIcon(notification.priority)
      }
    }
    
    // สำหรับผู้ใช้ทั่วไป: ใช้ไอคอนตามความสำคัญ
    return getPriorityIcon(notification.priority)
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "medium":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-green-500" />
    }
  }

  const getNotificationTypeText = (type) => {
    switch (type) {
      case "appointment_reminder":
        return "เตือนนัดหมาย"
      case "vaccination_due":
        return "ถึงกำหนดฉีดวัคซีน"
      case "medication_reminder":
        return "เตือนให้ยา"
      case "checkup_due":
        return "ถึงกำหนดตรวจสุขภาพ"
      case "article_published":
        return "บทความใหม่"
      default:
        return type
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      default:
        return "border-l-green-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.role === "veterinarian" ? "งานของฉัน" 
                 : user?.role === "admin" ? "การจัดการระบบ"
                 : "การแจ้งเตือน"}
              </h1>
              <p className="text-gray-600 mb-3">
                {user?.role === "veterinarian" 
                  ? "จัดการงานและติดตามการแจ้งเตือนที่สำคัญ" 
                  : user?.role === "admin"
                  ? "ดูแลและอนุมัติเนื้อหาต่างๆ ในระบบ"
                  : "ติดตามกำหนดการสำคัญของสัตว์เลี้ยงของคุณ"
                }
              </p>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-sm text-green-600 font-medium">เชื่อมต่อแบบ Real-time</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">ไม่ได้เชื่อมต่อ</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {unreadCount > 0 && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>{unreadCount} การแจ้งเตือนใหม่</span>
                </div>
              )}
              {notifications.filter(n => !n.is_read).length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(user?.role === "veterinarian" 
              ? [
                  { key: "all", label: "ทั้งหมด" },
                  { key: "urgent", label: "ด่วน" },
                  { key: "updates", label: "นัดหมาย" },
                  { key: "pending", label: "รอดำเนินการ" },
                  { key: "completed", label: "เสร็จสิ้น" },
                ]
              : [
                  { key: "all", label: "ทั้งหมด" },
                  { key: "unread", label: "ยังไม่อ่าน" },
                  { key: "pending", label: "รอดำเนินการ" },
                  { key: "completed", label: "เสร็จสิ้น" },
                ]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === "veterinarian" ? "ไม่มีงานที่ต้องทำ" : "ไม่มีการแจ้งเตือน"}
            </h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? (user?.role === "veterinarian" ? "ทุกงานเสร็จสิ้นแล้ว" : "ทุกอย่างเป็นไปตามกำหนด") 
                : "ไม่มีรายการในหมวดนี้"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.is_read ? "bg-blue-50" : ""
                } ${notification.is_completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`text-lg font-medium ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                          >
                            ทำเครื่องหมายอ่านแล้ว
                          </button>
                        )}

                        {!notification.is_completed && (
                          <button
                            onClick={() => markAsCompleted(notification.id)}
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>เสร็จสิ้น</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
