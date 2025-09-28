"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import {
  Users,
  PawPrint,
  FileText,
  Calendar,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState({ appointments: [], nutrition_guidelines: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingApproval, setProcessingApproval] = useState(false)
  const [userImages, setUserImages] = useState({})

  useEffect(() => {
    fetchAdminData()
  }, [])

  // Load user images when users data changes
  useEffect(() => {
    if (users.length > 0) {
      loadUserImages()
    }
  }, [users])

  const loadUserImages = async () => {
    const imagePromises = users.map(async (user) => {
      if (user.profile_picture_url && !user.profile_picture_url.startsWith('data:')) {
        try {
          const filename = user.profile_picture_url.includes('/') ? user.profile_picture_url.split('/').pop() : user.profile_picture_url
          const response = await fetch(`http://localhost:5000/api/upload/image/${filename}`, {
            mode: 'cors',
            credentials: 'omit'
          })
          if (response.ok) {
            const blob = await response.blob()
            const reader = new FileReader()
            const base64Image = await new Promise((resolve) => {
              reader.onload = (e) => resolve(e.target.result)
              reader.readAsDataURL(blob)
            })
            return { userId: user.id, image: base64Image }
          }
        } catch (error) {
          console.error(`Failed to load image for user ${user.id}:`, error)
        }
      }
      return { userId: user.id, image: null }
    })

    const results = await Promise.all(imagePromises)
    const imageMap = {}
    results.forEach(({ userId, image }) => {
      if (image) {
        imageMap[userId] = image
      }
    })
    setUserImages(imageMap)
  }

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse, approvalsResponse] = await Promise.allSettled([
        apiClient.get("/admin/statistics"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/pending-approvals"),
      ])

      // Process stats
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data)
      }

      // Process users
      if (usersResponse.status === 'fulfilled') {
        setUsers(usersResponse.value.data)
      }

      // Process approvals
      if (approvalsResponse.status === 'fulfilled') {
        setPendingApprovals(approvalsResponse.value.data)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserStatusUpdate = async (userId, isActive) => {
    try {
      console.log("=== Frontend User Status Update Debug ===")
      console.log("User ID:", userId)
      console.log("Is Active:", isActive, typeof isActive)
      console.log("Request payload:", { is_active: isActive })
      
      await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive })
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)))
      alert(`อัพเดทสถานะผู้ใช้${isActive ? "เปิดใช้" : "ระงับ"}สำเร็จแล้ว`)
    } catch (error) {
      console.error("Failed to update user status:", error)
      console.error("Error response:", error.response?.data)
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleApprovalAction = (item, type, action) => {
    setSelectedApproval({ ...item, type })
    setApprovalAction(action)
    setRejectionReason("")
    setShowApprovalModal(true)
  }

  const processApproval = async () => {
    if (!selectedApproval) return

    setProcessingApproval(true)
    try {
      const endpoint =
        selectedApproval.type === "appointment"
          ? `/admin/appointments/${selectedApproval.id}/approve`
          : `/admin/nutrition-guidelines/${selectedApproval.id}/approve`

      const payload = {
        action: approvalAction,
        rejection_reason: approvalAction === "reject" ? rejectionReason : null,
      }

      await apiClient.patch(endpoint, payload)

      // อัพเดทข้อมูลในหน้า
      if (selectedApproval.type === "appointment") {
        setPendingApprovals((prev) => ({
          ...prev,
          appointments: prev.appointments.filter((a) => a.id !== selectedApproval.id),
        }))
      } else {
        setPendingApprovals((prev) => ({
          ...prev,
          nutrition_guidelines: prev.nutrition_guidelines.filter((n) => n.id !== selectedApproval.id),
        }))
      }

      // อัพเดทสถิติ
      setStats((prev) => ({
        ...prev,
        pending_appointments:
          selectedApproval.type === "appointment" ? prev.pending_appointments - 1 : prev.pending_appointments,
        pending_nutrition_guidelines:
          selectedApproval.type === "nutrition"
            ? prev.pending_nutrition_guidelines - 1
            : prev.pending_nutrition_guidelines,
      }))

      setShowApprovalModal(false)
      setSelectedApproval(null)
      alert(`${approvalAction === "approve" ? "อนุมัติ" : "ปฏิเสธ"}สำเร็จแล้ว`)
    } catch (error) {
      console.error("Failed to process approval:", error)
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`)
    } finally {
      setProcessingApproval(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAppointmentTypeText = (type) => {
    const types = {
      checkup: "ตรวจสุขภาพ",
      vaccination: "ฉีดวัคซีน",
      consultation: "ปรึกษา",
      surgery: "ผ่าตัด",
      emergency: "ฉุกเฉิน",
    }
    return types[type] || type
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                <Users className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
              <p className="text-gray-600 mt-2">สวัสดี, {user.full_name}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ผู้ใช้งานทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0} คน</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">สัตว์เลี้ยงในระบบ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_pets || 0} ตัว</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">รอการอนุมัติ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.pending_appointments || 0) + (stats.pending_nutrition_guidelines || 0)} รายการ
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">บทความ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_articles || 0} บทความ</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ผู้ใช้งานทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">สัตว์เลี้ยงในระบบ</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">รอการอนุมัติ</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">บทความ</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: "overview", label: "ภาพรวม" },
              {
                key: "approvals",
                label: `การอนุมัติ (${(stats?.pending_appointments || 0) + (stats?.pending_nutrition_guidelines || 0)})`,
              },
              { key: "users", label: "จัดการผู้ใช้" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* User Growth Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">การเติบโตของผู้ใช้งาน</h3>
              <div className="flex items-end space-x-4 h-64">
                {stats?.user_growth ? (
                  stats.user_growth.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-green-500 rounded-t-md w-full transition-all duration-500"
                        style={{ height: `${(data.users / 100) * 200}px` }}
                      ></div>
                      <div className="mt-2 text-sm text-gray-600">{data.month}</div>
                      <div className="text-sm font-medium text-gray-900">{data.users}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500">
                    กำลังโหลดข้อมูล...
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติการใช้งาน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ผู้ใช้ใหม่เดือนนี้</span>
                    <span className="font-medium text-green-600">+{stats?.new_users_this_month || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สัตว์เลี้ยงที่เพิ่มเดือนนี้</span>
                    <span className="font-medium text-blue-600">+{stats?.new_pets_this_month || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">การนัดหมายเดือนนี้</span>
                    <span className="font-medium text-purple-600">{stats?.appointments_this_month || 0}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ประเภทผู้ใช้งาน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">เจ้าของสัตว์เลี้ยง</span>
                    <span className="font-medium">{users.filter((u) => u.role === "user").length} คน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สัตวแพทย์</span>
                    <span className="font-medium">{users.filter((u) => u.role === "veterinarian").length} คน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ผู้ดูแลระบบ</span>
                    <span className="font-medium">{users.filter((u) => u.role === "admin").length} คน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-8">
            {/* Pending Appointments */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  การนัดหมายรอการอนุมัติ ({pendingApprovals.appointments?.length || 0})
                </h3>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>

              {!pendingApprovals.appointments || pendingApprovals.appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">ไม่มีการนัดหมายรอการอนุมัติ</div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-gray-900">
                              {getAppointmentTypeText(appointment.appointment_type)}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              รอการอนุมัติ
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                  <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p><strong>เจ้าของ:</strong> {appointment.owner_name}</p>
                              </div>
                              <p>
                                <strong>สัตว์เลี้ยง:</strong> {appointment.pet_name}
                              </p>
                              <p>
                                <strong>สัตวแพทย์:</strong> {appointment.veterinarian_name}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>วันที่:</strong> {formatDateTime(appointment.appointment_date)}
                              </p>
                              <p>
                                <strong>สร้างโดย:</strong> {appointment.created_by_role === "user" ? "ผู้ใช้" : "สัตวแพทย์"}
                              </p>
                              <p>
                                <strong>สร้างเมื่อ:</strong> {formatDateTime(appointment.created_at)}
                              </p>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>หมายเหตุ:</strong> {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApprovalAction(appointment, "appointment", "approve")}
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>อนุมัติ</span>
                          </button>
                          <button
                            onClick={() => handleApprovalAction(appointment, "appointment", "reject")}
                            className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>ปฏิเสธ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Nutrition Guidelines */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  แผนโภชนาการรอการอนุมัติ ({pendingApprovals.nutrition_guidelines?.length || 0})
                </h3>
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>

              {!pendingApprovals.nutrition_guidelines || pendingApprovals.nutrition_guidelines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">ไม่มีแผนโภชนาการรอการอนุมัติ</div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.nutrition_guidelines.map((guideline) => (
                    <div key={guideline.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-900">แผนโภชนาการ - {guideline.species_name}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">รอการอนุมัติ</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p>
                                <strong>สัตวแพทย์:</strong> {guideline.veterinarian_name}
                              </p>
                              <p>
                                <strong>ชนิดสัตว์:</strong> {guideline.species_name}
                              </p>
                              <p>
                                <strong>สายพันธุ์:</strong> {guideline.breed_name || "ทั่วไป"}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>แคลอรี่/วัน:</strong> {guideline.daily_calories} kcal
                              </p>
                              <p>
                                <strong>โปรตีน:</strong> {guideline.protein_percentage}%
                              </p>
                              <p>
                                <strong>ไขมัน:</strong> {guideline.fat_percentage}%
                              </p>
                              <p>
                                <strong>มื้อ/วัน:</strong> {guideline.feeding_frequency} มื้อ
                              </p>
                            </div>
                          </div>

                          {guideline.special_instructions && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>คำแนะนำพิเศษ:</strong> {guideline.special_instructions}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApprovalAction(guideline, "nutrition", "approve")}
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>อนุมัติ</span>
                          </button>
                          <button
                            onClick={() => handleApprovalAction(guideline, "nutrition", "reject")}
                            className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>ปฏิเสธ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h2>
              <button
                onClick={async () => {
                  try {
                    const response = await apiClient.post("/admin/migrate-users")
                    const data = response.data
                    
                    if (data.sql_commands) {
                      const sqlText = data.sql_commands.join('\n\n')
                      const instructions = data.instructions
                      
                      alert(`${data.message}\n\nSQL Commands:\n${sqlText}\n\nInstructions:\n${instructions}`)
                    } else {
                      alert("Migration สำเร็จแล้ว! กรุณา refresh หน้าเว็บ")
                      window.location.reload()
                    }
                  } catch (error) {
                    alert(`Migration ล้มเหลว: ${error.response?.data?.error || error.message}`)
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                รัน Migration
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ใช้งาน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่สมัคร
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เข้าสู่ระบบล่าสุด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {userImages[user.id] || (user.profile_picture_url && user.profile_picture_url.startsWith('data:')) ? (
                                <img 
                                  src={userImages[user.id] || user.profile_picture_url} 
                                  alt={user.full_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center ${(userImages[user.id] || (user.profile_picture_url && user.profile_picture_url.startsWith('data:'))) ? 'hidden' : 'flex'}`}>
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "veterinarian"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role === "admin" ? "ผู้ดูแล" : user.role === "veterinarian" ? "สัตวแพทย์" : "ผู้ใช้"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString("th-TH") : "ยังไม่เคย"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.is_active ? "ใช้งาน" : "ระงับ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== "admin" && (
                            <div className="flex space-x-2">
                              {user.is_active ? (
                                <button
                                  onClick={() => handleUserStatusUpdate(user.id, false)}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                >
                                  <UserX className="h-4 w-4" />
                                  <span>ระงับ</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusUpdate(user.id, true)}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  <span>เปิดใช้</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {approvalAction === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
                {selectedApproval.type === "appointment" ? "การนัดหมาย" : "แผนโภชนาการ"}
              </h2>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">รายละเอียด:</h3>
                {selectedApproval.type === "appointment" ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>ประเภท:</strong> {getAppointmentTypeText(selectedApproval.appointment_type)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p><strong>เจ้าของ:</strong> {selectedApproval.owner_name}</p>
                  </div>
                  <p>
                    <strong>สัตว์เลี้ยง:</strong> {selectedApproval.pet_name}
                  </p>
                  <p>
                    <strong>สัตวแพทย์:</strong> {selectedApproval.veterinarian_name}
                  </p>
                  <p>
                    <strong>วันที่:</strong> {formatDateTime(selectedApproval.appointment_date)}
                  </p>
                </div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>สัตวแพทย์:</strong> {selectedApproval.veterinarian_name}
                    </p>
                    <p>
                      <strong>ชนิดสัตว์:</strong> {selectedApproval.species_name}
                    </p>
                    <p>
                      <strong>แคลอรี่/วัน:</strong> {selectedApproval.daily_calories} kcal
                    </p>
                    <p>
                      <strong>โปรตีน:</strong> {selectedApproval.protein_percentage}%
                    </p>
                    <p>
                      <strong>ไขมัน:</strong> {selectedApproval.fat_percentage}%
                    </p>
                  </div>
                )}
              </div>

              {approvalAction === "reject" && (
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    เหตุผลในการปฏิเสธ *
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="กรุณาระบุเหตุผล..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={processApproval}
                  disabled={processingApproval || (approvalAction === "reject" && !rejectionReason.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    approvalAction === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {processingApproval ? "กำลังดำเนินการ..." : approvalAction === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
