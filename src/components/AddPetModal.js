"use client"

import { useState } from "react"
import apiClient from "../services/api"
import { X } from "lucide-react"
import ImageUpload from "./ImageUpload"

const AddPetModal = ({ onClose, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    gender: "",
    weight: "0",
    color: "",
    photo_url: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sanitize form data before submission
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        color: formData.color || null,
        photo_url: formData.photo_url || null,
      };

      // Now using apiClient, which automatically includes the token
      const response = await apiClient.post("/pets", petData);
      onPetAdded(response.data);
      onClose() // Close the modal on success
    } catch (error) {
      // Improved error handling to display more details from the backend
      const backendError = error.response?.data;
      if (typeof backendError === 'object' && backendError !== null) {
        // If the error is an object, stringify it to show all details
        setError(JSON.stringify(backendError));
      } else {
        // Fallback for other types of errors
        setError(backendError || "เกิดข้อผิดพลาดในการเพิ่มสัตว์เลี้ยง");
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มสัตว์เลี้ยงใหม่</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-input"
              placeholder="ชื่อสัตว์เลี้ยง"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
              ชนิดสัตว์ *
            </label>
            <select
              id="species"
              name="species"
              required
              className="form-input"
              value={formData.species}
              onChange={handleChange}
            >
              <option value="">เลือกชนิดสัตว์</option>
              <option value="dog">สุนัข</option>
              <option value="cat">แมว</option>
              <option value="bird">นก</option>
              <option value="rabbit">กระต่าย</option>
              <option value="hamster">หนูแฮมสเตอร์</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
              สายพันธุ์
            </label>
            <input
              type="text"
              id="breed"
              name="breed"
              className="form-input"
              placeholder="สายพันธุ์ (ถ้ามี)"
              value={formData.breed}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันเกิด
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              className="form-input"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              เพศ
            </label>
            <select id="gender" name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
              <option value="">เลือกเพศ</option>
              <option value="male">ผู้</option>
              <option value="female">เมีย</option>
              <option value="unknown">ไม่ระบุ</option>
            </select>
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              น้ำหนัก (กก.)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              step="0.1"
              className="form-input"
              placeholder="น้ำหนักปัจจุบัน"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              สี
            </label>
            <input
              type="text"
              id="color"
              name="color"
              className="form-input"
              placeholder="สีของสัตว์เลี้ยง"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพสัตว์เลี้ยง
            </label>
            <ImageUpload
              onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, photo_url: imageUrl }))}
              currentImage={formData.photo_url}
              className="w-full"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเพิ่ม..." : "เพิ่มสัตว์เลี้ยง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPetModal