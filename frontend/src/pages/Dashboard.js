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
                const response = await fetch(`http://localhost:5000/api/upload/image/${filename}`)
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


  // แดชบอร์ดสำหรับผู้ใช้ทั่วไป (โค้ดเดิม)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                <PawPrint className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                สวัสดี, <span className="text-green-600 font-bold">{user?.full_name}</span>
              </h1>
              <p className="text-gray-600 mt-2">ยินดีต้อนรับสู่แดชบอร์ดการดูแลสัตว์เลี้ยงของคุณ</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">สัตว์เลี้ยงของฉัน</p>
                <p className="text-2xl font-bold text-gray-900">{pets.length} ตัว</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">นัดหมายถัดไป</p>
                {appointments.length > 0 ? (
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(appointments[0].appointment_date).toLocaleString("th-TH", {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointments[0].pets?.name || 'N/A'} - {appointments[0].appointment_type}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">-</p>
                )}
              </div>
            </div>
          </div>

          <Link to="/appointments" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">นัดหมาย</p>
                <p className="text-lg font-bold text-gray-900">จัดการนัดหมาย</p>
              </div>
            </div>
          </Link>
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

          {/* Notifications Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h2>
              <Link to="/notifications" className="text-green-500 hover:text-green-600">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="card text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">ไม่มีการแจ้งเตือน</p>
                  <p className="text-sm text-gray-500">ทุกอย่างเป็นไปตามกำหนด</p>
                </div>
              ) : (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="card">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${notification.priority === "high"
                            ? "bg-red-500"
                            : notification.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.due_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            กำหนด: {new Date(notification.due_date).toLocaleDateString("th-TH")}
                          </p>
                        )}
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