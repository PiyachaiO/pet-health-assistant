"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import ImageUpload from "../components/ImageUpload"

const Profile = () => {
  const { user, updateUser, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
      })
      
      // Load existing profile image
      if (user.profile_picture_url) {
        try {
          const url = user.profile_picture_url
          if (url.startsWith('data:') || url.startsWith('http')) {
            setProfileImage(url)
          } else {
            const filename = url.includes('/') ? url.split('/').pop() : url
            fetch(`${process.env.REACT_APP_API_URL}/upload/image/${filename}`)
              .then(response => {
                if (response.ok) return response.blob()
                throw new Error('Failed to load image')
              })
              .then(blob => {
                const reader = new FileReader()
                reader.onload = (e) => setProfileImage(e.target.result)
                reader.readAsDataURL(blob)
              })
              .catch(error => {
                console.error('Failed to load existing profile image:', error)
                setProfileImage(null)
              })
          }
        } catch (error) {
          console.error('Failed to load existing profile image:', error)
          setProfileImage(null)
        }
      } else {
        setProfileImage(null)
      }
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUploaded = async (imageUrl) => {
    setProfileImage(imageUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const updateData = {
        ...formData,
        profile_picture_url: profileImage || null
      }

      await apiClient.put("/users/profile", updateData)
      
      // Update user context directly first
      updateUser({
        ...user,
        ...formData,
        profile_picture_url: profileImage
      })

      // Then try to refresh user data to get updated profile picture
      try {
        await refreshUser()
      } catch (error) {
        console.error("Failed to refresh user data:", error)
        // Don't show error to user since the update was successful
      }

      setMessage("บันทึกข้อมูลสำเร็จแล้ว")
    } catch (error) {
      console.error("Failed to update profile:", error)
      setMessage(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
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
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับไปแดชบอร์ด</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลส่วนตัวและรูปโปรไฟล์</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">รูปโปรไฟล์</h2>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <ImageUpload 
                  currentImage={profileImage} 
                  onImageUploaded={handleImageUploaded} 
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลส่วนตัว</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="08x-xxx-xxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      วันที่สมัคร
                    </label>
                    <input
                      type="text"
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString("th-TH") : ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    ที่อยู่
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="กรอกที่อยู่ของคุณ"
                  />
                </div>

                {/* Role Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">ข้อมูลบัญชี</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ประเภทผู้ใช้:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        user?.role === "admin" ? "bg-purple-100 text-purple-800" :
                        user?.role === "veterinarian" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user?.role === "admin" ? "ผู้ดูแลระบบ" :
                         user?.role === "veterinarian" ? "สัตวแพทย์" : "ผู้ใช้ทั่วไป"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">สถานะ:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        user?.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user?.is_active ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes("สำเร็จ") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
