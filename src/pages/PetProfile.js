"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { ArrowLeft, Heart, Plus, Calendar, Pill, Syringe, Stethoscope, Utensils, MoreVertical, Edit, Trash2, User, Phone, Mail, MapPin, Clock, FileText, AlertCircle } from "lucide-react"
import AddHealthRecordModal from "../components/AddHealthRecordModal"
import ImageUpload from "../components/ImageUpload"

const PetProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pet, setPet] = useState(null)
  const [healthRecords, setHealthRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [vetRecommendation, setVetRecommendation] = useState(null)
  const [showAddRecordModal, setShowAddRecordModal] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [petImage, setPetImage] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchPetData = useCallback(async () => {
    try {
      const [petResponse, recordsResponse] = await Promise.allSettled([
        apiClient.get(`/pets/${id}`),
        apiClient.get(`/pets/${id}/health-records`),
      ])

      // Handle pet data
      if (petResponse.status === 'fulfilled') {
        setPet(petResponse.value.data)
        const photoUrl = petResponse.value.data.photo_url
        if (photoUrl) {
          // For existing images, try to fetch and convert to base64
          if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('http://localhost:5000/api/upload/image/')) {
            try {
              const filename = photoUrl.includes('/') ? photoUrl.split('/').pop() : photoUrl
              const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image/${filename}`)
              if (response.ok) {
                const blob = await response.blob()
                const reader = new FileReader()
                reader.onload = (e) => setPetImage(e.target.result)
                reader.readAsDataURL(blob)
              } else {
                setPetImage(null)
              }
            } catch (error) {
              console.error('Failed to load existing image:', error)
              setPetImage(null)
            }
          } else {
            setPetImage(photoUrl)
          }
        } else {
          setPetImage(null)
        }
      } else {
        console.error('Failed to fetch pet:', petResponse.reason)
        setPet(null)
      }

      // Handle health records
      if (recordsResponse.status === 'fulfilled') {
        setHealthRecords(recordsResponse.value.data)
      } else {
        console.error('Failed to fetch health records:', recordsResponse.reason)
        setHealthRecords([])
      }

      // ดึงข้อมูลนัดหมายสำหรับสัตว์เลี้ยงตัวนี้ (เฉพาะสัตวแพทย์)
      if (user?.role === 'veterinarian') {
        try {
          const appointmentsRes = await apiClient.get(`/appointments/vet?pet_id=${id}`)
          let appointmentsData = []
          if (appointmentsRes.data?.appointments) {
            appointmentsData = appointmentsRes.data.appointments
          } else if (Array.isArray(appointmentsRes.data)) {
            appointmentsData = appointmentsRes.data
          }
          setAppointments(appointmentsData)
        } catch (e) {
          console.error('Failed to fetch appointments:', e)
        }
      }

      // ดึงคำแนะนำโภชนาการจากสัตวแพทย์สำหรับสัตว์เลี้ยงตัวนี้
      try {
        console.log('[PetProfile] pet id:', id)
        const recRes = await apiClient.get(`/nutrition/recommendations?pet_id=${id}`)
        console.log('[PetProfile] rec response:', recRes.status, recRes.data)
        const plans = Array.isArray(recRes.data) ? recRes.data : []
        if (plans.length > 0) setVetRecommendation(plans[0])
      } catch (e) {
        console.error('Failed to fetch nutrition recommendation:', e)
      }
    } catch (error) {
      console.error("Failed to fetch pet data:", error)
    } finally {
      setLoading(false)
    }
  }, [id, user?.role])

  useEffect(() => {
    fetchPetData()
  }, [fetchPetData])

  const handleRecordAdded = (newRecord) => {
    setHealthRecords([...healthRecords, newRecord])
    setShowAddRecordModal(false)
  }

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/pets/${id}`)
      navigate("/dashboard")
    } catch (error) {
      console.error("Failed to delete pet:", error)
      // You might want to show an error message to the user
    }
  }

  const getRecordIcon = (type) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="h-5 w-5 text-blue-500" />
      case "medication":
        return <Pill className="h-5 w-5 text-green-500" />
      case "checkup":
        return <Stethoscope className="h-5 w-5 text-purple-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return "ไม่ระบุ"

    const today = new Date()
    const birth = new Date(birthDate)
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths} เดือน`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลสัตว์เลี้ยง</h2>
          <Link to="/dashboard" className="btn-primary">
            กลับไปแดชบอร์ด
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={user?.role === 'veterinarian' ? "/pets" : "/dashboard"} className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไป{user?.role === 'veterinarian' ? 'รายการสัตว์เลี้ยง' : 'แดชบอร์ด'}</span>
        </Link>

        {/* Page Title for Veterinarians */}
        {user?.role === 'veterinarian' && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลผู้ป่วย</h1>
            <p className="text-gray-600">ดูข้อมูลสัตว์เลี้ยงและประวัติการรักษา</p>
          </div>
        )}

        {/* Pet Header */}
        <div className="card mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {petImage ? (
                <img src={petImage || "/placeholder.svg"} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                {user?.role === 'veterinarian' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    ผู้ป่วย
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ชนิด:</span>
                  <p className="font-medium">{pet.species}</p>
                </div>
                <div>
                  <span className="text-gray-600">สายพันธุ์:</span>
                  <p className="font-medium">{pet.breed || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <span className="text-gray-600">อายุ:</span>
                  <p className="font-medium">{calculateAge(pet.birth_date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">น้ำหนัก:</span>
                  <p className="font-medium">{pet.weight} กก.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn-icon">
                <MoreVertical className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <Link
                      to={`/pets/${id}/edit`}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="mr-3 h-4 w-4" />
                      <span>แก้ไขข้อมูล</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      <span>ลบสัตว์เลี้ยง</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: "general", label: "ข้อมูลทั่วไป" },
              { key: "health", label: "ประวัติสุขภาพ" },
              { key: "nutrition", label: "โภชนาการ" },
              ...(user?.role === 'veterinarian' ? [{ key: "appointments", label: "นัดหมาย" }] : []),
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
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">รูปภาพสัตว์เลี้ยง</h2>
              <ImageUpload 
                currentImage={petImage} 
                onImageUploaded={async (imageUrl) => {
                  setPetImage(imageUrl)
                  // อัปเดตข้อมูลในฐานข้อมูล
                  try {
                    const updateData = { photo_url: imageUrl || null }
                    await apiClient.put(`/pets/${id}`, updateData)
                    setPet(prev => ({ ...prev, photo_url: imageUrl }))
                  } catch (error) {
                    console.error('Failed to update pet image:', error)
                    alert('เกิดข้อผิดพลาดในการอัปเดตรูปภาพ')
                  }
                }} 
                className="max-w-sm" 
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pet Information */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลสัตว์เลี้ยง</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                    <p className="text-gray-900">{pet.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                    <p className="text-gray-900">
                      {pet.gender === "male" ? "ผู้" : pet.gender === "female" ? "เมีย" : "ไม่ระบุ"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                    <p className="text-gray-900">
                      {pet.birth_date ? new Date(pet.birth_date).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สี</label>
                    <p className="text-gray-900">{pet.color || "ไม่ระบุ"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนัก</label>
                    <p className="text-gray-900">{pet.weight ? `${pet.weight} กก.` : "ไม่ระบุ"}</p>
                  </div>
                  {pet.special_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุพิเศษ</label>
                      <p className="text-gray-900">{pet.special_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Information (for veterinarians) */}
              {user?.role === 'veterinarian' && pet.users && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลเจ้าของ</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {pet.users?.profile_picture_url ? (
                          <img 
                            src={pet.users.profile_picture_url} 
                            alt={pet.users?.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${pet.users?.profile_picture_url ? 'hidden' : 'flex'}`}>
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                        <p className="text-gray-900">{pet.users.full_name || "ไม่ระบุ"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                        <p className="text-gray-900">{pet.users.email || "ไม่ระบุ"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ลงทะเบียน</label>
                        <p className="text-gray-900">
                          {pet.created_at ? new Date(pet.created_at).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">ประวัติสุขภาพ</h2>
              {user?.role !== 'veterinarian' && (
                <button onClick={() => setShowAddRecordModal(true)} className="btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>เพิ่มบันทึกใหม่</span>
                </button>
              )}
            </div>

            {healthRecords.length === 0 ? (
              <div className="card text-center py-12">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีประวัติสุขภาพ</h3>
                <p className="text-gray-600 mb-4">
                  {user?.role === 'veterinarian' 
                    ? `สัตว์เลี้ยง ${pet.name} ยังไม่มีประวัติการรักษา` 
                    : `เพิ่มบันทึกสุขภาพแรกของ ${pet.name}`
                  }
                </p>
                {user?.role !== 'veterinarian' && (
                  <button onClick={() => setShowAddRecordModal(true)} className="btn-primary">
                    เพิ่มบันทึกใหม่
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {healthRecords.map((record) => (
                  <div key={record.id} className="card">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getRecordIcon(record.record_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                            <p className="text-gray-600 mt-1">{record.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>วันที่: {new Date(record.record_date).toLocaleDateString("th-TH")}</span>
                              {record.next_due_date && (
                                <span>ครั้งถัดไป: {new Date(record.next_due_date).toLocaleDateString("th-TH")}</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              record.record_type === "vaccination"
                                ? "bg-blue-100 text-blue-800"
                                : record.record_type === "medication"
                                  ? "bg-green-100 text-green-800"
                                  : record.record_type === "checkup"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.record_type === "vaccination"
                              ? "วัคซีน"
                              : record.record_type === "medication"
                                ? "ยา"
                                : record.record_type === "checkup"
                                  ? "ตรวจสุขภาพ"
                                  : record.record_type}
                          </span>
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
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">คำแนะนำโภชนาการ</h2>
              {vetRecommendation ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">คำแนะนำจากสัตวแพทย์</h3>
                    <p className="text-gray-700 whitespace-pre-line">{vetRecommendation.custom_instructions}</p>
                  </div>
                  <div>
                    <Link to={`/pets/${pet.id}/nutrition?plan_id=${vetRecommendation.id}`} className="btn-secondary">ดูรายละเอียดเพิ่มเติม</Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีคำแนะนำโภชนาการ</h3>
                  <p className="text-gray-600 mb-6">ไปยังหน้าคำแนะนำเพื่อดูหรือให้สัตวแพทย์เพิ่ม</p>
                  <Link to={`/pets/${pet.id}/nutrition`} className="btn-primary inline-flex items-center space-x-2">
                    <Utensils className="h-4 w-4" />
                    <span>ดูคำแนะนำโภชนาการ</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "appointments" && user?.role === 'veterinarian' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">ประวัติการนัดหมาย</h2>
              <Link to="/appointments" className="btn-primary flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>จัดการนัดหมาย</span>
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีประวัติการนัดหมาย</h3>
                <p className="text-gray-600 mb-4">สัตว์เลี้ยงตัวนี้ยังไม่เคยมีนัดหมาย</p>
                <Link to="/appointments" className="btn-primary">
                  ดูนัดหมายทั้งหมด
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          appointment.status === 'confirmed' ? 'bg-green-500' : 
                          appointment.status === 'scheduled' ? 'bg-yellow-500' :
                          appointment.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{appointment.appointment_type}</h4>
                          <p className="text-gray-600 mt-1">
                            {new Date(appointment.appointment_date).toLocaleString("th-TH", {
                              dateStyle: 'full',
                              timeStyle: 'short'
                            })}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {appointment.user?.profile_picture_url ? (
                                  <img 
                                    src={appointment.user.profile_picture_url} 
                                    alt={appointment.user?.full_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center ${appointment.user?.profile_picture_url ? 'hidden' : 'flex'}`}>
                                  <svg className="h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              <span>เจ้าของ: {appointment.user?.full_name || appointment.user?.email || 'ไม่ระบุ'}</span>
                            </div>
                            <span>สัตวแพทย์: {appointment.veterinarian?.full_name || appointment.veterinarian?.email || 'ไม่ระบุ'}</span>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                              <strong>หมายเหตุ:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'scheduled' ? 'รอยืนยัน' :
                           appointment.status === 'confirmed' ? 'ยืนยันแล้ว' :
                           appointment.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                        </span>
                        <div className="text-xs text-gray-500">
                          สร้างเมื่อ: {new Date(appointment.created_at).toLocaleDateString("th-TH")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Health Record Modal */}
      {showAddRecordModal && (
        <AddHealthRecordModal
          petId={id}
          petName={pet.name}
          onClose={() => setShowAddRecordModal(false)}
          onRecordAdded={handleRecordAdded}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ยืนยันการลบ</h3>
            <p className="text-gray-600 mb-6">คุณแน่ใจหรือไม่ที่จะลบ {pet.name}? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                ยกเลิก
              </button>
              <button onClick={handleDelete} className="btn-danger">
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PetProfile
