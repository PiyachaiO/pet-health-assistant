"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { Calendar, Users, FileText, Utensils, Plus, CheckCircle, TrendingUp, Clock, AlertCircle, PawPrint, X } from "lucide-react"
import AddNutritionModal from "../components/AddNutritionModal"

const VetDashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [nutritionGuidelines, setNutritionGuidelines] = useState([])
  const [articles, setArticles] = useState([])
  const [patientPets, setPatientPets] = useState([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalArticles: 0,
    totalPatientPets: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("appointments")
  const [showAddNutritionModal, setShowAddNutritionModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [userImages, setUserImages] = useState({})
  const [petImages, setPetImages] = useState({})

  const fetchVetData = useCallback(async () => {
    try {
      const [appointmentsResponse, nutritionResponse, articlesResponse, petsResponse] = await Promise.allSettled([
        apiClient.get("/appointments/vet"),
        apiClient.get("/nutrition/guidelines"),
        apiClient.get("/articles"),
        apiClient.get("/pets") // ดึงข้อมูลสัตว์เลี้ยงทั้งหมดสำหรับสัตวแพทย์
      ])

      // console.log("=== VetDashboard API Responses ===")
      // console.log("Appointments Response:", appointmentsResponse)
      // console.log("Nutrition Response:", nutritionResponse)
      // console.log("Articles Response:", articlesResponse)

      // ประมวลผลข้อมูล Appointments
      if (appointmentsResponse.status === 'fulfilled') {
        const responseData = appointmentsResponse.value.data
        // console.log("Appointments Response Data:", responseData)
        
        // ลองหลายรูปแบบของ response structure
        let appointmentsData = []
        if (responseData.appointments) {
          appointmentsData = responseData.appointments
        } else if (Array.isArray(responseData)) {
          appointmentsData = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          appointmentsData = responseData.data
        }
        
        // console.log("Processed Appointments Data:", appointmentsData)
        setAppointments(appointmentsData)
        // console.log("Appointments state set to:", appointmentsData.length, "items")
        
        // คำนวณสถิติ
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayAppointments = appointmentsData.filter(a => {
          const appointmentDate = new Date(a.appointment_date)
          appointmentDate.setHours(0, 0, 0, 0)
          return appointmentDate.getTime() === today.getTime()
        }).length

        const pendingAppointments = appointmentsData.filter(a => a.status === 'scheduled').length

        setStats(prev => ({
          ...prev,
          totalAppointments: appointmentsData.length,
          todayAppointments,
          pendingAppointments
        }))
      }

      // ประมวลผลข้อมูล Nutrition Guidelines
      if (nutritionResponse.status === 'fulfilled') {
        const responseData = nutritionResponse.value.data
        // console.log("Nutrition Response Data:", responseData)
        
        let nutritionData = []
        if (Array.isArray(responseData)) {
          nutritionData = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          nutritionData = responseData.data
        }
        
        // console.log("Processed Nutrition Data:", nutritionData)
        setNutritionGuidelines(nutritionData)
        // console.log("Nutrition Guidelines state set to:", nutritionData.length, "items")
      }

      // ประมวลผลข้อมูล Articles
      if (articlesResponse.status === 'fulfilled') {
        const responseData = articlesResponse.value.data
        // console.log("Articles Response Data:", responseData)
        
        let articlesData = []
        if (responseData.articles) {
          articlesData = responseData.articles
        } else if (Array.isArray(responseData)) {
          articlesData = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          articlesData = responseData.data
        }
        
        // console.log("Processed Articles Data:", articlesData)
        setArticles(articlesData)
        // console.log("Articles state set to:", articlesData.length, "items")
        setStats(prev => ({
          ...prev,
          totalArticles: articlesData.length
        }))
      }

      // ประมวลผลข้อมูล Patient Pets
      if (petsResponse.status === 'fulfilled') {
        const responseData = petsResponse.value.data
        // console.log("Pets Response Data:", responseData)
        
        let petsData = []
        if (responseData.pets) {
          petsData = responseData.pets
        } else if (Array.isArray(responseData)) {
          petsData = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          petsData = responseData.data
        }
        
        // Load images for pets that have photo_url
        const petsWithImages = await Promise.all(
          petsData.map(async (pet) => {
            if (pet.photo_url) {
              try {
                // For existing images, try to fetch and convert to base64
                if (pet.photo_url.startsWith('/uploads/') || pet.photo_url.startsWith('http://localhost:5000/api/upload/image/')) {
                  const filename = pet.photo_url.includes('/') ? pet.photo_url.split('/').pop() : pet.photo_url
                  const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image/${filename}`)
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
        
        // console.log("Processed Pets Data:", petsWithImages)
        // console.log("Sample Pet Data Structure:", petsWithImages[0]) // ดูโครงสร้างข้อมูลตัวอย่าง
        setPatientPets(petsWithImages)
        // console.log("Patient Pets state set to:", petsWithImages.length, "items")
        setStats(prev => ({
          ...prev,
          totalPatientPets: petsWithImages.length
        }))
      }
    } catch (error) {
      console.error("Failed to fetch vet data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchVetData()
  }
  }, [user, fetchVetData])

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${status}`)
      await apiClient.patch(`/appointments/${appointmentId}/status`, { status })
      setAppointments(appointments.map((a) => (a.id === appointmentId ? { ...a, status } : a)))
      // อัปเดตสถิติ
      fetchVetData()
      console.log(`Successfully updated appointment ${appointmentId} to ${status}`)
    } catch (error) {
      console.error("Failed to update appointment status:", error)
      if (error.response?.data?.message) {
        alert(`ไม่สามารถอัปเดตสถานะได้: ${error.response.data.message}`)
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะนัดหมาย")
      }
    }
  }

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }

  const handleNutritionAdded = (newGuideline) => {
    setNutritionGuidelines([...nutritionGuidelines, newGuideline])
    setShowAddNutritionModal(false)
  }

  // Debug: Log current state values (commented out for production)
  // console.log("=== VetDashboard Render State ===")
  // console.log("Loading:", loading)
  // console.log("Appointments:", appointments.length, appointments)
  // console.log("Nutrition Guidelines:", nutritionGuidelines.length, nutritionGuidelines)
  // console.log("Articles:", articles.length, articles)
  // console.log("Patient Pets:", patientPets.length, patientPets)
  // console.log("Stats:", stats)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Enhanced */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                {user.profile_picture_url ? (
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
                <div className={`w-full h-full flex items-center justify-center ${user.profile_picture_url ? 'hidden' : 'flex'}`}>
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดสัตวแพทย์</h1>
                <p className="text-gray-600 mt-1">สวัสดี, {user.full_name}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">ออนไลน์</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Link 
                to="/appointments" 
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">ดูนัดหมายทั้งหมด</span>
              </Link>
              <Link 
                to="/nutrition" 
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Utensils className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">จัดการโภชนาการ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity - Simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">นัดหมายล่าสุด</h3>
              <Link to="/appointments" className="text-green-600 hover:text-green-700 text-sm font-medium">
                ดูทั้งหมด
              </Link>
            </div>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">ยังไม่มีนัดหมาย</p>
                </div>
              ) : (
                appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleAppointmentClick(appointment)}>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.pets?.name || 'N/A'} - {appointment.appointment_type === "checkup" ? "ตรวจสุขภาพ" : appointment.appointment_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleDateString("th-TH")} {new Date(appointment.appointment_date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      appointment.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                      appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                      appointment.status === "completed" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {appointment.status === "scheduled" ? "รอยืนยัน" :
                       appointment.status === "confirmed" ? "ยืนยันแล้ว" :
                       appointment.status === "completed" ? "เสร็จสิ้น" : "ยกเลิก"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Patient Pets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">สัตว์เลี้ยงผู้ป่วย</h3>
              <Link to="/pets" className="text-green-600 hover:text-green-700 text-sm font-medium">
                ดูทั้งหมด
              </Link>
            </div>
            <div className="space-y-3">
              {patientPets.length === 0 ? (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">ยังไม่มีข้อมูล</p>
                </div>
              ) : (
                patientPets.slice(0, 4).map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden">
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
                        <PawPrint className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pet.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pet.species || 'N/A'} • {pet.breed || 'N/A'}
                        {pet.weight && ` • ${pet.weight} กก.`}
                      </p>
                      <p className="text-xs text-gray-400">
                        เจ้าของ: {pet.users?.full_name || pet.user?.full_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Priority Actions - Enhanced */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">การดำเนินการสำคัญ</h3>
                <p className="text-gray-600 mt-1">สิ่งที่ต้องทำก่อนเป็นอันดับแรก</p>
              </div>
              <Link to="/notifications" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1">
                <span>ดูทั้งหมด</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* นัดหมายรอยืนยัน - Priority 1 */}
              <div className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                stats.pendingAppointments > 0 
                  ? 'bg-red-50 border-red-200 hover:border-red-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {stats.pendingAppointments > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {stats.pendingAppointments}
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stats.pendingAppointments > 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`h-6 w-6 ${stats.pendingAppointments > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">นัดหมายรอยืนยัน</p>
                    <p className={`text-2xl font-bold ${stats.pendingAppointments > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {stats.pendingAppointments} ราย
                    </p>
                    {stats.pendingAppointments > 0 && (
                      <p className="text-xs text-red-600 mt-1">ต้องดำเนินการด่วน</p>
                    )}
                  </div>
                </div>
                {stats.pendingAppointments > 0 && (
                  <div className="mt-3">
                    <Link 
                      to="/appointments" 
                      className="block w-full text-center bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      ดูรายการ
                    </Link>
                  </div>
                )}
              </div>

              {/* นัดหมายวันนี้ - Priority 2 */}
              <div className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                stats.todayAppointments > 0 
                  ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stats.todayAppointments > 0 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`h-6 w-6 ${stats.todayAppointments > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">นัดหมายวันนี้</p>
                    <p className={`text-2xl font-bold ${stats.todayAppointments > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {stats.todayAppointments} ราย
                    </p>
                    {stats.todayAppointments > 0 && (
                      <p className="text-xs text-blue-600 mt-1">เตรียมตัวให้พร้อม</p>
                    )}
                  </div>
                </div>
                {stats.todayAppointments > 0 && (
                  <div className="mt-3">
                    <Link 
                      to="/appointments" 
                      className="block w-full text-center bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      ดูรายการ
                    </Link>
                  </div>
                )}
              </div>

              {/* สถิติรวม */}
              <div className="relative p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">นัดหมายทั้งหมด</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalAppointments} ราย</p>
                    <p className="text-xs text-gray-500 mt-1">รวมทั้งหมด</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Link 
                    to="/appointments" 
                    className="block w-full text-center bg-gray-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    ดูทั้งหมด
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "appointments", label: "นัดหมาย", icon: Calendar, count: appointments.length },
              { key: "nutrition", label: "โภชนาการ", icon: Utensils, count: nutritionGuidelines.length },
              { key: "articles", label: "บทความ", icon: FileText, count: articles.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key 
                    ? "bg-green-500 text-white shadow-lg transform scale-105" 
                    : "bg-white text-gray-600 hover:text-gray-900 hover:shadow-md border border-gray-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key 
                      ? "bg-white bg-opacity-20 text-white" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Tab Content */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">นัดหมายของฉัน</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">ทั้งหมด {appointments.length} รายการ</span>
              </div>
            </div>
            
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16">
                <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">ยังไม่มีนัดหมาย</h3>
                <p className="text-gray-600 mb-6">นัดหมายจะแสดงที่นี่เมื่อมีผู้ใช้จองคิว</p>
                <Link 
                  to="/appointments" 
                  className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>ดูนัดหมายทั้งหมด</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => handleAppointmentClick(appointment)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <Calendar className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {appointment.appointment_type === "checkup" ? "ตรวจสุขภาพ" : 
                             appointment.appointment_type === "vaccination" ? "ฉีดวัคซีน" :
                             appointment.appointment_type === "grooming" ? "ตัดขน" :
                             appointment.appointment_type === "surgery" ? "ผ่าตัด" :
                             appointment.appointment_type}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(appointment.appointment_date).toLocaleDateString("th-TH")}</span>
                              <span>
                                {new Date(appointment.appointment_date).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <PawPrint className="h-4 w-4 text-gray-400" />
                              <span>สัตว์เลี้ยง: {appointment.pets?.name || 'N/A'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>เจ้าของ: {appointment.user?.full_name || 'N/A'}</span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "completed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}>
                          {appointment.status === "scheduled"
                            ? "รอยืนยัน"
                            : appointment.status === "confirmed"
                              ? "ยืนยันแล้ว"
                              : appointment.status === "completed"
                                ? "เสร็จสิ้น"
                                : "ยกเลิก"}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {appointment.status === "scheduled" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusUpdate(appointment.id, "confirmed")
                                }}
                                className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>ยืนยัน</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusUpdate(appointment.id, "cancelled")
                                }}
                                className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                <span>ยกเลิก</span>
                              </button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(appointment.id, "completed")
                              }}
                              className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>เสร็จสิ้น</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">จัดการข้อมูลโภชนาการ</h2>
              <button
                onClick={() => setShowAddNutritionModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มคำแนะนำใหม่</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {nutritionGuidelines.map((guideline) => (
                <div key={guideline.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{guideline.species}</h3>
                      <p className="text-gray-600">อายุ: {guideline.age_range}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">แคลอรี่ต่อวัน:</span>
                      <span className="font-medium">{guideline.daily_calories} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">โปรตีน:</span>
                      <span className="font-medium">{guideline.protein_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ไขมัน:</span>
                      <span className="font-medium">{guideline.fat_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">มื้อต่อวัน:</span>
                      <span className="font-medium">{guideline.feeding_frequency} มื้อ</span>
                    </div>
                  </div>

                  {guideline.instructions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{guideline.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "articles" && (
           <div className="card text-center py-12">
               <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">จัดการบทความ</h3>
               <p className="text-gray-600 mb-4">คุณสามารถสร้าง, แก้ไข, และลบบทความของคุณได้จากที่นี่</p>
               <a href="/admin/articles" className="btn-primary">ไปที่หน้าจัดการบทความ</a>
           </div>
        )}

      </div>

      {/* Add Nutrition Modal */}
      {showAddNutritionModal && (
        <AddNutritionModal onClose={() => setShowAddNutritionModal(false)} onNutritionAdded={handleNutritionAdded} />
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">รายละเอียดนัดหมาย</h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ประเภทนัดหมาย</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAppointment.appointment_type === "checkup" ? "ตรวจสุขภาพ" : 
                     selectedAppointment.appointment_type === "vaccination" ? "ฉีดวัคซีน" :
                     selectedAppointment.appointment_type === "grooming" ? "ตัดขน" :
                     selectedAppointment.appointment_type === "surgery" ? "ผ่าตัด" :
                     selectedAppointment.appointment_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedAppointment.status === "scheduled"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedAppointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedAppointment.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedAppointment.status === "scheduled"
                      ? "รอยืนยัน"
                      : selectedAppointment.status === "confirmed"
                        ? "ยืนยันแล้ว"
                        : selectedAppointment.status === "completed"
                          ? "เสร็จสิ้น"
                          : "ยกเลิก"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันที่</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">เวลา</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedAppointment.appointment_date).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">สัตว์เลี้ยง</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedAppointment.pets?.name || 'N/A'} ({selectedAppointment.pets?.species || 'N/A'})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">เจ้าของ</label>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedAppointment.user?.profile_picture_url ? (
                      <img 
                        src={selectedAppointment.user.profile_picture_url} 
                        alt={selectedAppointment.user?.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${selectedAppointment.user?.profile_picture_url ? 'hidden' : 'flex'}`}>
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      {selectedAppointment.user?.full_name || 'N/A'} ({selectedAppointment.user?.email || 'N/A'})
                    </p>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">หมายเหตุ</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  ปิด
                </button>
                {selectedAppointment.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, "confirmed")
                        setShowAppointmentModal(false)
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      ยืนยันนัดหมาย
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, "cancelled")
                        setShowAppointmentModal(false)
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      ยกเลิกนัดหมาย
                    </button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, "completed")
                      setShowAppointmentModal(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    เสร็จสิ้น
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VetDashboard
