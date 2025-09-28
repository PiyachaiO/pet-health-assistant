"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { uploadService } from "../services"
import { User, Mail, Phone, Home, Camera } from "lucide-react"

const EditProfile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    profile_picture_url: "",
  })
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      const initialFormData = {
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profile_picture_url: user.profile_picture_url || "",
      };
      setFormData(initialFormData);
      setPreviewImage(initialFormData.profile_picture_url);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setError("");

      try {
        const uploadRes = await uploadService.uploadFile(file);

        if (uploadRes && uploadRes.file && uploadRes.file.url) {
          const newImageUrl = uploadRes.file.url;
          // 1. เก็บ URL ใหม่ไว้ใน state แยก
          setNewProfileImage(newImageUrl);
          // 2. อัปเดตภาพตัวอย่างให้ user เห็น
          setPreviewImage(newImageUrl);
          setError("");
        } else {
          setError(uploadRes?.error || "Failed to get image URL from response.");
        }
      } catch (err) {
        console.error("Image Upload Error:", err);
        setError("Failed to upload image. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // สร้าง object ที่จะส่งไปอัปเดต
    let dataToUpdate = { ...formData };

    // 3. ตรวจสอบว่ามีรูปใหม่หรือไม่ ถ้ามี ให้ใช้ URL จาก newProfileImage
    // This logic is correct, ensuring the new image URL is included if it exists.
    if (newProfileImage) {
      dataToUpdate.profile_picture_url = newProfileImage;
    }

    const updateResult = await updateProfile(dataToUpdate);

    if (updateResult.success) {
      navigate("/dashboard");
    } else {
      setError(updateResult.error || "Failed to update profile.");
    }

    setLoading(false);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">แก้ไขข้อมูลส่วนตัว</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${previewImage}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  // ถ้ามีไฟล์ placeholder-user.jpg ใน public ให้ใช้ path ที่ถูกต้อง เช่น /images/placeholder-user.jpg
                  // ถ้าไม่มีไฟล์ ให้ไม่แสดงรูปเลย
                  null
                )}
                <label
                  htmlFor="profile_picture"
                  className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="profile_picture"
                    name="profile_picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  readOnly
                  className="form-input pl-10 bg-gray-100 cursor-not-allowed"
                  value={formData.email}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input pl-10"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  className="form-input pl-10"
                  placeholder="กรอกที่อยู่ของคุณ"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-secondary"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile