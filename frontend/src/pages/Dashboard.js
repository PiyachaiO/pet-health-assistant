"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { petService, notificationService, appointmentService } from "../services"
import { useApi } from "../hooks"
import { Plus, Heart, Bell, Calendar, PawPrint } from "lucide-react"
import AddPetModal from "../components/AddPetModal"

const Dashboard = () => {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [showAddPetModal, setShowAddPetModal] = useState(false)
  const { loading, execute } = useApi()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setPets([]);
    setNotifications([]);
    setAppointments([]);

    // สำหรับผู้ใช้ทั่วไป - ใช้โค้ดเดิม
    const [petsResult, notificationsResult, appointmentsResult] = await Promise.allSettled([
      execute(() => petService.getPets()),
      execute(() => notificationService.getNotifications()),
      execute(() => appointmentService.getAppointments())
    ]);

    // 1. ประมวลผลข้อมูล Pets
    if (petsResult.status === 'fulfilled' && petsResult.value?.success) {
      const petsData = petsResult.value.pets || [];
      
      // Load images for pets that have photo_url
      const petsWithImages = await Promise.all(
        petsData.map(async (pet) => {
          if (pet.photo_url) {
            try {
              // For existing images, try to fetch and convert to base64
              if (pet.photo_url.startsWith('/uploads/') || pet.photo_url.startsWith('http://localhost:5000/api/upload/image/')) {
                const filename = pet.photo_url.includes('/') ? pet.photo_url.split('/').pop() : pet.photo_url
                const response = await fetch(`${process.env.REACT_APP_API_URL.replace('/api', '')}/upload/image/${filename}`)
                if (response.ok) {
                  const blob = await response.blob()
                  const reader = new FileReader()
                  return new Promise((resolve) => {
                    reader.onload = (e) => {
                      resolve({ ...pet, photo_url: e.target.result })
                    }
                    reader.readAsDataURL(blob)
                  })
                }
              }
            } catch (error) {
              console.error('Failed to load pet image:', error)
            }
          }
          return pet
        })
      )
      
      setPets(petsWithImages);
    }

    // 2. ประมวลผลข้อมูล Notifications
    if (notificationsResult.status === 'fulfilled') {
      let allNotis = [];
      if (Array.isArray(notificationsResult.value)) {
        allNotis = notificationsResult.value;
      } else if (notificationsResult.value?.success && Array.isArray(notificationsResult.value.notifications)) {
        allNotis = notificationsResult.value.notifications;
      } else if (notificationsResult.value?.notifications && Array.isArray(notificationsResult.value.notifications)) {
        allNotis = notificationsResult.value.notifications;
      }
      
      const sortedNotifications = allNotis
        .filter(notification => !notification.is_completed)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      
      setNotifications(sortedNotifications);
    }

    // 3. ประมวลผลข้อมูล Appointments
    if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value?.success) {
      const allAppointments = appointmentsResult.value.appointments || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduledAppointments = allAppointments
        .filter(a => {
          const appointmentDate = new Date(a.appointment_date);
          const appointmentDateOnly = new Date(appointmentDate);
          appointmentDateOnly.setHours(0, 0, 0, 0);
          return a.status !== "cancelled" && appointmentDateOnly.getTime() >= today.getTime();
        })
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

      setAppointments(scheduledAppointments);
    }
  }, [user, execute]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]); // ลบ execute ออกจาก dependency array

  const handlePetAdded = (newPet) => {
    setShowAddPetModal(false);
    fetchDashboardData();
  }

  // Redirect veterinarians to vet dashboard
  if (user && user.role === "veterinarian") {
    return <Navigate to="/vet-dashboard" replace />
  }

  // Redirect admins to admin dashboard
  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  if (loading && pets.length === 0 && appointments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  
  // Derived UI state
  const unreadCount = notifications.filter((n) => !n.is_read).length
  const urgentCount = notifications.filter((n) => !n.is_read && (n.priority === "high" || n.priority === "urgent")).length
  const nextAppointment = appointments.length > 0 ? appointments[0] : null

  // แดชบอร์ดสำหรับผู้ใช้ทั่วไป
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Enhanced */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                {user?.profile_picture_url ? (
                  <img 
                    src={user.profile_picture_url} 
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${user?.profile_picture_url ? 'hidden' : 'flex'}`}>
                  <PawPrint className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">สวัสดี, <span className="text-green-600">{user?.full_name}</span></h1>
                <p className="text-gray-600 mt-1">ดูสถานะการดูแลสัตว์เลี้ยงทั้งหมดของคุณได้ที่นี่</p>
                <div className="flex items-center space-x-3 mt-2 text-sm">
                  <span className="text-gray-600">สัตว์เลี้ยง {pets.length} ตัว</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">แจ้งเตือนที่ยังไม่อ่าน {unreadCount} รายการ</span>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <button onClick={() => setShowAddPetModal(true)} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">เพิ่มสัตว์เลี้ยง</span>
              </button>
              <Link to="/appointments" className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">นัดหมาย</span>
              </Link>
              <Link to="/notifications" className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <Bell className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">แจ้งเตือน</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">การดำเนินการสำคัญ</h3>
                <p className="text-gray-600 mt-1">สิ่งที่ควรทำต่อไป</p>
              </div>
              <Link to="/notifications" className="text-green-600 hover:text-green-700 text-sm font-medium">ดูการแจ้งเตือน</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Urgent notifications */}
              <div className={`relative p-4 rounded-xl border-2 transition-all ${urgentCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                {urgentCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{urgentCount}</div>
                )}
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${urgentCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Bell className={`h-6 w-6 ${urgentCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">การแจ้งเตือนสำคัญ</p>
                    <p className={`text-2xl font-bold ${urgentCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{urgentCount} รายการ</p>
                  </div>
                </div>
                {urgentCount > 0 && (
                  <div className="mt-3">
                    <Link to="/notifications" className="block w-full text-center bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">เปิดดู</Link>
                  </div>
                )}
              </div>

              {/* Next appointment */}
              <div className={`p-4 rounded-xl border-2 bg-blue-50 border-blue-200`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">นัดหมายถัดไป</p>
                    {nextAppointment ? (
                      <>
                        <p className="text-lg font-semibold text-blue-700">
                          {new Date(nextAppointment.appointment_date).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{nextAppointment.pets?.name || 'N/A'} • {nextAppointment.appointment_type}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">-
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pets count */}
              <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <PawPrint className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">สัตว์เลี้ยงของฉัน</p>
                    <p className="text-2xl font-bold text-green-600">{pets.length} ตัว</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Pets Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">สัตว์เลี้ยงของฉัน</h2>
              <button onClick={() => setShowAddPetModal(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>เพิ่มสัตว์เลี้ยงใหม่</span>
              </button>
            </div>

            {pets.length === 0 ? (
              <div className="card text-center py-12">
                <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีสัตว์เลี้ยง</h3>
                <p className="text-gray-600 mb-4">เพิ่มสัตว์เลี้ยงแรกของคุณเพื่อเริ่มต้นการดูแล</p>
                <button onClick={() => setShowAddPetModal(true)} className="btn-primary">
                  เพิ่มสัตว์เลี้ยงใหม่
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <Link key={pet.id} to={`/pets/${pet.id}`} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {pet.photo_url ? (
                          <img 
                            src={pet.photo_url} 
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${pet.photo_url ? 'hidden' : 'flex'}`}>
                          <Heart className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-gray-600">
                          {pet.species} • {pet.breed}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Section - Enhanced */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h2>
              <Link to="/notifications" className="text-green-600 hover:text-green-700">ดูทั้งหมด</Link>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-10">
                  <Bell className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">ไม่มีการแจ้งเตือน</p>
                  <p className="text-sm text-gray-500">ทุกอย่างเป็นไปตามกำหนด</p>
                </div>
              ) : (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-2 ${notification.priority === 'high' || notification.priority === 'urgent' ? 'bg-red-500' : notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(notification.created_at || notification.due_date).toLocaleString('th-TH', { dateStyle: 'medium' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to="/notifications" className="text-sm text-green-600 hover:text-green-700">เปิด</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Pet Modal */}
          {showAddPetModal && <AddPetModal onClose={() => setShowAddPetModal(false)} onPetAdded={handlePetAdded} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard