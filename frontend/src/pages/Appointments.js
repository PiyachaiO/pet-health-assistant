"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { Calendar, Clock, User, Plus, CheckCircle, XCircle } from "lucide-react"
import BookAppointmentModal from "../components/BookAppointmentModal"

const Appointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processingApproval, setProcessingApproval] = useState(false)
  const [userImages, setUserImages] = useState({})

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Load user images when appointments data changes
  useEffect(() => {
    if (appointments.length > 0) {
      loadUserImages()
    }
  }, [appointments])

  const loadUserImages = async () => {
    const imagePromises = appointments.map(async (appointment) => {
      if (appointment.user?.profile_picture_url && !appointment.user.profile_picture_url.startsWith('data:')) {
        try {
          const filename = appointment.user.profile_picture_url.includes('/') ? appointment.user.profile_picture_url.split('/').pop() : appointment.user.profile_picture_url
          const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image/${filename}`, {
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
            return { userId: appointment.user.id, image: base64Image }
          }
        } catch (error) {
          console.error(`Failed to load image for user ${appointment.user.id}:`, error)
        }
      }
      return { userId: appointment.user?.id, image: null }
    })

    const results = await Promise.all(imagePromises)
    const imageMap = {}
    results.forEach(({ userId, image }) => {
      if (userId && image) {
        imageMap[userId] = image
      }
    })
    setUserImages(imageMap)
  }

  const fetchAppointments = async () => {
    try {
      let endpoint = "/appointments"
      
      // กำหนด endpoint ตาม role
      if (user?.role === "veterinarian") {
        endpoint = "/appointments/vet"
      } else if (user?.role === "admin") {
        // แอดมินดูการนัดหมายทั้งหมด (ใช้ vet endpoint เพื่อดูทั้งหมด)
        endpoint = "/appointments/vet"
      }
      
      const response = await apiClient.get(endpoint)
      setAppointments(response.data)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentBooked = (newAppointment) => {
    setAppointments([...appointments, newAppointment])
    setShowBookModal(false)
  }

  const [updatingStatus, setUpdatingStatus] = useState(new Set());

  const handleUpdateStatus = async (id, status) => {
    // ป้องกันการคลิกซ้ำ
    if (updatingStatus.has(id)) {
      return;
    }

    setUpdatingStatus(prev => new Set(prev).add(id));
    
    try {
      const response = await apiClient.patch(`/appointments/${id}/status`, { status });
      // Update the appointment in the list
      setAppointments(appointments.map(app => app.id === id ? response.data : app));
    } catch (error) {
      console.error(`Failed to update appointment status to ${status}:`, error);
      
      // แสดง error message ที่เป็นมิตรกับผู้ใช้
      if (error.response?.status === 429) {
        alert('กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (ระบบกำลังประมวลผล)');
      } else {
        alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "รอยืนยัน"
      case "confirmed":
        return "ยืนยันแล้ว"
      case "completed":
        return "เสร็จสิ้น"
      case "cancelled":
        return "ยกเลิก"
      default:
        return status
    }
  }

  const getAppointmentTypeText = (type) => {
    switch (type) {
      case "checkup":
        return "ตรวจสุขภาพทั่วไป";
      case "vaccination":
        return "ฉีดวัคซีน";
      case "consultation":
        return "ปรึกษาปัญหา";
      case "surgery":
        return "ผ่าตัด";
      case "emergency":
        return "ฉุกเฉิน";
      default:
        return type;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleApprovalAction = (appointment, action) => {
    setSelectedAppointment(appointment)
    setApprovalAction(action)
    setRejectionReason("")
    setShowApprovalModal(true)
  }

  const processApproval = async () => {
    if (!selectedAppointment) return

    setProcessingApproval(true)
    try {
      const endpoint = `/admin/appointments/${selectedAppointment.id}/approve`
      const payload = {
        action: approvalAction,
        rejection_reason: approvalAction === "reject" ? rejectionReason : null,
      }

      await apiClient.patch(endpoint, payload)

      // อัพเดทข้อมูลในหน้า
      setAppointments(appointments.filter((a) => a.id !== selectedAppointment.id))

      setShowApprovalModal(false)
      setSelectedAppointment(null)
      alert(`${approvalAction === "approve" ? "อนุมัติ" : "ปฏิเสธ"}สำเร็จแล้ว`)
    } catch (error) {
      console.error("Failed to process approval:", error)
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`)
    } finally {
      setProcessingApproval(false)
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">การนัดหมาย</h1>
            <p className="text-gray-600 mt-2">
              {user?.role === "veterinarian" 
                ? "จัดการนัดหมายของสัตวแพทย์" 
                : user?.role === "admin"
                ? "ดูการนัดหมายทั้งหมดในระบบ"
                : "จัดการนัดหมายกับสัตวแพทย์"
              }
            </p>
          </div>
          {user?.role !== "admin" && (
          <button onClick={() => setShowBookModal(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>จองนัดหมาย</span>
          </button>
          )}
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีการนัดหมาย</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === "veterinarian" 
                ? "ยังไม่มีนัดหมายที่ต้องดูแล" 
                : user?.role === "admin"
                ? "ยังไม่มีการนัดหมายในระบบ"
                : "จองนัดหมายกับสัตวแพทย์เพื่อดูแลสุขภาพสัตว์เลี้ยงของคุณ"
              }
            </p>
            {user?.role !== "admin" && (
            <button onClick={() => setShowBookModal(true)} className="btn-primary">
              จองนัดหมายแรก
            </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className={`border rounded-lg p-4 ${
                appointment.status === "scheduled" ? "bg-orange-50" : 
                appointment.status === "confirmed" ? "bg-green-50" :
                appointment.status === "completed" ? "bg-gray-50" :
                appointment.status === "cancelled" ? "bg-red-50" : "bg-gray-50"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {getAppointmentTypeText(appointment.appointment_type)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === "scheduled" ? "bg-orange-100 text-orange-800" :
                        appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                        appointment.status === "completed" ? "bg-gray-100 text-gray-800" :
                        appointment.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {userImages[appointment.user?.id] || (appointment.user?.profile_picture_url && appointment.user.profile_picture_url.startsWith('data:')) ? (
                              <img 
                                src={userImages[appointment.user?.id] || appointment.user.profile_picture_url} 
                                alt={appointment.user?.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${(userImages[appointment.user?.id] || (appointment.user?.profile_picture_url && appointment.user.profile_picture_url.startsWith('data:'))) ? 'hidden' : 'flex'}`}>
                              <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <p><strong>เจ้าของ:</strong> {appointment.user?.full_name || appointment.user?.email || 'ไม่ระบุ'}</p>
                        </div>
                        <p><strong>สัตว์เลี้ยง:</strong> {appointment.pets?.name || 'ไม่ระบุ'} ({appointment.pets?.species || 'ไม่ระบุ'})</p>
                        <p><strong>สัตวแพทย์:</strong> {appointment.veterinarian?.full_name || appointment.veterinarian?.email || 'ไม่ระบุ'}</p>
                        </div>
                      <div>
                        <p><strong>วันที่:</strong> {formatDateTime(appointment.appointment_date)}</p>
                        <p><strong>สร้างเมื่อ:</strong> {formatDateTime(appointment.created_at)}</p>
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

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ดูรายละเอียด
                    </button>
                    
                    {appointment.status === "scheduled" && user?.role === "admin" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovalAction(appointment, "approve")}
                          className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>อนุมัติ</span>
                        </button>
                        <button
                          onClick={() => handleApprovalAction(appointment, "reject")}
                          className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>ปฏิเสธ</span>
                        </button>
                      </div>
                    )}
                    
                    {appointment.status === "scheduled" && user?.role !== "admin" && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')} 
                          disabled={updatingStatus.has(appointment.id)}
                          className={`text-green-600 hover:text-green-700 ${updatingStatus.has(appointment.id) ? 'opacity-50 cursor-not-allowed' : ''}`} 
                          title="ยืนยันนัดหมาย"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')} 
                          disabled={updatingStatus.has(appointment.id)}
                          className={`text-red-600 hover:text-red-700 ${updatingStatus.has(appointment.id) ? 'opacity-50 cursor-not-allowed' : ''}`} 
                          title="ยกเลิกนัดหมาย"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <BookAppointmentModal 
          onClose={() => setShowBookModal(false)} 
          onAppointmentBooked={handleAppointmentBooked}
          currentUser={user}
        />
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดนัดหมาย</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">สัตว์เลี้ยง</p>
                  <p className="text-gray-900">{selectedAppointment.pets?.name || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">ประเภทสัตว์</p>
                  <p className="text-gray-900">{selectedAppointment.pets?.species || 'ไม่ระบุ'} - {selectedAppointment.pets?.breed || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">สี</p>
                  <p className="text-gray-900">{selectedAppointment.pets?.color || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">น้ำหนัก</p>
                  <p className="text-gray-900">{selectedAppointment.pets?.weight ? `${selectedAppointment.pets.weight} กก.` : 'ไม่ระบุ'}</p>
                </div>
              </div>
              
              {(user?.role === "veterinarian" || user?.role === "admin") && selectedAppointment.user && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">เจ้าของสัตว์เลี้ยง</p>
                      <p className="text-gray-900">{selectedAppointment.user?.full_name || selectedAppointment.user?.email || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700">สัตวแพทย์</p>
                <p className="text-gray-900">{selectedAppointment.veterinarian?.full_name || selectedAppointment.veterinarian?.email || 'ไม่ระบุ'}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700">วันที่และเวลา</p>
                <p className="text-gray-900">{new Date(selectedAppointment.appointment_date).toLocaleString('th-TH')}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700">ประเภทการนัดหมาย</p>
                <p className="text-gray-900">{getAppointmentTypeText(selectedAppointment.appointment_type)}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700">สถานะ</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>
              
              {selectedAppointment.notes && (
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-700">หมายเหตุ</p>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="border-t pt-4 text-xs text-gray-500">
                <p>สร้างเมื่อ: {new Date(selectedAppointment.created_at).toLocaleString('th-TH')}</p>
                {selectedAppointment.updated_at && selectedAppointment.updated_at !== selectedAppointment.created_at && (
                  <p>อัปเดตล่าสุด: {new Date(selectedAppointment.updated_at).toLocaleString('th-TH')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {approvalAction === "approve" ? "อนุมัติ" : "ปฏิเสธ"}การนัดหมาย
              </h2>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">รายละเอียด:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>ประเภท:</strong> {getAppointmentTypeText(selectedAppointment.appointment_type)}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                        <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p><strong>เจ้าของ:</strong> {selectedAppointment.user?.full_name || selectedAppointment.user?.email || 'ไม่ระบุ'}</p>
                  </div>
                  <p><strong>สัตว์เลี้ยง:</strong> {selectedAppointment.pets?.name || 'ไม่ระบุ'}</p>
                  <p><strong>สัตวแพทย์:</strong> {selectedAppointment.veterinarian?.full_name || selectedAppointment.veterinarian?.email || 'ไม่ระบุ'}</p>
                  <p><strong>วันที่:</strong> {formatDateTime(selectedAppointment.appointment_date)}</p>
                </div>
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

export default Appointments
